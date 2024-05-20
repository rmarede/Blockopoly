// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";
import "./interface/permissioning/IAccountRegistry.sol";
import "./utils/Strings.sol";


contract SaleAgreementOld is Context {

    event PreSaleAgreement(address indexed buyer, address indexed seller, address indexed realty);
    event DeedTransfer(address indexed buyer, address indexed seller, address indexed realty);
    event SaleWithdrawal(address indexed buyer, address indexed seller, address indexed realty);

    enum Status { PENDING, AGREED, COMPLETED, WITHDRAWN }

    struct SaleDetails {
        address buyer;
        address seller;
        address realty;
        uint share;
        uint price;
        uint earnest;
        address realtor;
        uint comission; // 100 is 1%
        uint contengencyPeriod; // TODO alguma coisa a fazer com isto?
        bytes contengencyClauses;
    }

    SaleDetails public details;
    Status public status;
    uint public createdAt;

    Status private buyerStatus;
    Status private sellerStatus;
    uint penaltyRequest;
    
    modifier onlyParties() {
        require(msg.sender == details.buyer || msg.sender == details.seller, "SaleAgreement: only buyer or seller can call this function");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == details.seller, "SaleAgreement: only seller can call this function");
        _;
    }

    modifier privileged() { // TODO 
        require(msg.sender == details.buyer || msg.sender == details.seller || isPrivileged(msg.sender), "SaleAgreement: only privileged entities can call this function");
        _;
    }

    constructor(address _cns, SaleDetails memory _details) Context(_cns) {
        require(_details.price > 0 && _details.earnest > 0 && _details.share > 0, "SaleAgreement: invalid input");
        require(_details.earnest <= _details.price, "SaleAgreement: earnest can not be more than price");
        require(_details.comission < 10000, "SaleAgreement: comission can not be more than 10000 (100.00%)");
        require(Ownership(_details.realty).shareOf(_details.seller) >= _details.share, "SaleAgreement: seller does not have enough shares");
        details = _details;
        status = Status.PENDING;
        buyerStatus = Status.PENDING;
        sellerStatus = Status.PENDING;
        createdAt = block.timestamp;
    }

    function consent() public onlyParties { // TODO mudar nome pre agreement, terms, consent, hold in escrow?
        require(status == Status.PENDING, "SaleAgreement: sale already agreed on");
        if (msg.sender == details.buyer) {
            buyerStatus = Status.AGREED;
        } else {
            sellerStatus = Status.AGREED;
        }
        if (buyerStatus == Status.AGREED && sellerStatus == Status.AGREED) {
            Ownership(details.realty).transferShares(details.seller, address(this), details.share);
            IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.earnest);
            status = Status.AGREED;
            emit PreSaleAgreement(details.buyer, details.seller, details.realty);
        }
    }

    function commit() public onlyParties {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");

        if (msg.sender == details.buyer) {
            buyerStatus = Status.COMPLETED;
        } else {
            sellerStatus = Status.COMPLETED;
        }

        if (buyerStatus == Status.COMPLETED && sellerStatus == Status.COMPLETED) {
            transfer();
            status = Status.COMPLETED;
        }
    }

    function transfer() private {
        IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.price - details.earnest);
        uint comm = details.price * details.comission / 10000;
        IERC20(walletContractAddress()).transfer(details.realtor, comm);
        IERC20(walletContractAddress()).transfer(details.seller, details.price - comm);
        Ownership(details.realty).transferShares(address(this), details.buyer, details.share);
        emit DeedTransfer(details.buyer, details.seller, details.realty);
    }

    function withdraw(uint _penalty) public privileged {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        require(_penalty <= details.earnest, "SaleAgreement: penalty can not be more than earnest");
        //require(block.timestamp - createdAt < details.contengencyPeriod, "SaleAgreement: contengency period already over");

        if (msg.sender == details.buyer) {
            buyerStatus = Status.WITHDRAWN;
        } else if (msg.sender == details.seller) {
            sellerStatus = Status.WITHDRAWN;
            penaltyRequest = _penalty;
        } else {
            penaltyRequest = _penalty;
        }

        if ((buyerStatus == Status.WITHDRAWN && sellerStatus == Status.WITHDRAWN) || isPrivileged(msg.sender)) {
            IERC20(walletContractAddress()).transfer(details.seller, penaltyRequest);
            if (details.earnest - penaltyRequest > 0) {
                IERC20(walletContractAddress()).transfer(details.buyer, details.earnest - penaltyRequest);
            }
            Ownership(details.realty).transferShares(address(this), details.seller, details.share);
            status = Status.WITHDRAWN;
            emit SaleWithdrawal(details.buyer, details.seller, details.realty);
        }
    }

    // executa funcoes no contrato Ownership do realty
    function executeTransaction(uint _value, bytes memory _data) public onlySeller {
        require(status == Status.AGREED, "SaleAgreement: realty not held in escrow");
        (bool success, ) = details.realty.call{value: _value}(_data);
        require(success, "SaleAgreement: transaction failed");
    }

    function isPrivileged(address _address) private view returns (bool) {
        return Strings.equals(IAccountRegistry(accountRegistryAddress()).orgOf(_address), "admin_org");
    }
  
}