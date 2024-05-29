// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";
import "./interface/permissioning/IAccountRegistry.sol";
import "./utils/Strings.sol";
import "./governance/SelfMultisig.sol";

contract SaleAgreement is Context, SelfMultisig {

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
    
    modifier onlyParties() {
        require(msg.sender == details.buyer || msg.sender == details.seller, "SaleAgreement: only buyer or seller can call this function");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "SaleAgreement: this operation can only be invoked by consensus");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == details.seller, "SaleAgreement: only seller can call this function");
        _;
    }

    modifier privileged() {
        require(msg.sender == address(this) || isPrivileged(msg.sender), "SaleAgreement: only privileged entities can call this function");
        _;
    }

    constructor(address _cns, SaleDetails memory _details) Context(_cns) SelfMultisig(_participants(_details.buyer, _details.seller), Policy.UNANIMOUS) {
        require(_details.buyer != address(0) && _details.seller != address(0) && _details.realty != address(0), "SaleAgreement: invalid input");
        require(_details.price > 0 && _details.earnest > 0 && _details.share > 0, "SaleAgreement: invalid input");
        //require(_details.buyer != _details.seller, "SaleAgreement: buyer and seller can not be the same");
        require(_details.earnest <= _details.price, "SaleAgreement: earnest can not be more than price");
        require(_details.comission < 10000, "SaleAgreement: comission can not be more than 10000 (100.00%)");
        require(Ownership(_details.realty).shareOf(_details.seller) >= _details.share, "SaleAgreement: seller does not have enough shares");
        details = _details;
        status = Status.PENDING;
        createdAt = block.timestamp;
    }

    function consent() public onlySelf { // TODO mudar nome pre agreement, terms, consent, hold in escrow?
        require(status == Status.PENDING, "SaleAgreement: sale already agreed on");
        Ownership(details.realty).transferShares(details.seller, address(this), details.share);
        IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.earnest);
        status = Status.AGREED;
        emit PreSaleAgreement(details.buyer, details.seller, details.realty);
    }

    function commit() public onlySelf {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.price - details.earnest);
        uint comm = details.price * details.comission / 10000;
        IERC20(walletContractAddress()).transfer(details.realtor, comm);
        IERC20(walletContractAddress()).transfer(details.seller, details.price - comm);
        Ownership(details.realty).transferShares(address(this), details.buyer, details.share);
        emit DeedTransfer(details.buyer, details.seller, details.realty);
        status = Status.COMPLETED;
    }

    function withdraw(uint _penalty) public privileged {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        require(_penalty <= details.earnest, "SaleAgreement: penalty can not be more than earnest");
        //require(block.timestamp - createdAt < details.contengencyPeriod, "SaleAgreement: contengency period already over");

        IERC20(walletContractAddress()).transfer(details.seller, _penalty);
        if (details.earnest - _penalty > 0) {
            IERC20(walletContractAddress()).transfer(details.buyer, details.earnest - _penalty);
        }
        Ownership(details.realty).transferShares(address(this), details.seller, details.share);
        status = Status.WITHDRAWN;
        emit SaleWithdrawal(details.buyer, details.seller, details.realty);
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

    function _participants(address _buyer, address _seller) private pure returns (address[] memory) {
        address[] memory res = new address[](2);
        res[0] = _buyer;
        res[1] = _seller;
        return res;
    }
  
}