// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";


contract SaleAgreement is Context {

    enum Status { PENDING, AGREED, COMPLETED, WIDTHDRAWN, BREACHED }

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

    bool private buyerSignature;
    bool private sellerSignature;

    modifier onlyParties() {
        require(msg.sender == details.buyer || msg.sender == details.seller, "SaleAgreement: only buyer or seller can call this function");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == details.seller, "SaleAgreement: only seller can call this function");
        _;
    }

    modifier privileged() { // TODO 
        require(msg.sender == details.realtor, "SaleAgreement: only privileged entities can call this function");
        _;
    }

    constructor(address _cns, SaleDetails memory _details) Context(_cns) {
        require(_details.price > 0 && _details.earnest > 0 && _details.share > 0, "SaleAgreement: invalid input");
        require(_details.earnest <= _details.price, "SaleAgreement: earnest can not be more than price");
        require(_details.comission < 10000, "SaleAgreement: comission can not be more than 10000 (100.00%)");
        require(Ownership(_details.realty).shareOf(_details.seller) >= _details.share, "SaleAgreement: seller does not have enough shares");
        details = _details;
        status = Status.PENDING;
        createdAt = block.timestamp;
    }

    function consent() public { // TODO mudar nome pre agreement, terms, consent, hold in escrow?
        require(status == Status.PENDING, "SaleAgreement: sale already agreed on");
        Ownership(details.realty).transferShares(details.seller, address(this), details.share);
        IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.earnest);
        status = Status.AGREED;
    }

    function commit() public onlyParties {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");

        if (msg.sender == details.buyer) {
            require(!buyerSignature, "SaleAgreement: this party has already signed");
            buyerSignature = true;
        } else {
            require(!sellerSignature, "SaleAgreement: this party has already signed");
            sellerSignature = true;
        }

        if (buyerSignature && sellerSignature) {
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
    }

    function widthdraw() public privileged {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        require(block.timestamp - createdAt < details.contengencyPeriod, "SaleAgreement: contengency period already over");
        IERC20(walletContractAddress()).transfer(details.buyer, details.earnest);
        Ownership(details.realty).transferShares(address(this), details.seller, details.share);
        status = Status.WIDTHDRAWN;
    }

    function breach(uint _penalty) public privileged {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        require(_penalty <= details.earnest, "SaleAgreement: penalty can not be more than earnest");
        IERC20(walletContractAddress()).transfer(details.seller, _penalty);
        if (details.earnest - _penalty > 0) {
            IERC20(walletContractAddress()).transfer(details.buyer, details.earnest - _penalty);
        }
        Ownership(details.realty).transferShares(address(this), details.seller, details.share);
        status = Status.BREACHED;
    }

    // executa funcoes no contrato Ownership do realty
    function executeTransaction(uint _value, bytes memory _data) public onlySeller {
        require(status == Status.AGREED, "SaleAgreement: realty not held in escrow");
        (bool success, ) = details.realty.call{value: _value}(_data);
        require(success, "SaleAgreement: transaction failed");
    }
  
}