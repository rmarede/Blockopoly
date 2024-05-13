// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./finance/PaymentSplitter.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";

// TODO escrever as clausulas qualitativas do contrato em comentarios?

contract RentalAgreement is PaymentSplitter {

    modifier expired() { // TODO a usar para funcoes tipo force terminate
        require(block.timestamp - paymentExpirationDate() >= PERIOD, "RentalAgreement: period has not passed since last payment");
        _;
    }

    modifier canPay() { // TODO recheck this, necessario ter paymentCounter == 0? 
        require(paymentCounter == 0 || (block.timestamp >= terms.startDate + ((paymentCounter-1) * PERIOD)), "RentalAgreement: cannot pay yet");
        _;
    }

    modifier rentTimeOver() {
        require(block.timestamp >= terms.startDate  + (terms.duration * PERIOD), "RentalAgreement: rent time is not over");
        _;
    }

    modifier active() {
        require(status == RentStatus.ACTIVE, "RentalAgreement: rent agreement is not active");
        _;
    }

    modifier completed() {
        require(status == RentStatus.COMPLETED, "RentalAgreement: rent agreement is terminated, cancelled or is not yet completed");
        _;
    }

    modifier onlyTenant() {
        require(msg.sender == tenant, "RentalAgreement: only tenant can call this function");
        _;
    }

    modifier onlyLandlord() {
        require(msg.sender == terms.realtyContract, "RentalAgreement: only ownership contract can call this function");
        _;
    }

    modifier onlyParties() {
        require(msg.sender == terms.realtyContract || msg.sender == tenant, "Only landlord or tenant can call this operation.");
        _;
    }

    enum RentStatus { PENDING, ACTIVE, COMPLETED, CONCLUDED, TERMINATED, EVICTED }
    uint public constant PERIOD = 30 days;
    
    struct RentalTerms {
        address realtyContract;
        uint rentValue;
        uint securityDeposit;
        uint startDate;
        uint duration; // in periods
        uint earlyTerminationFee;
        uint earlyTerminationNotice; // in periods
        string extra;
        address[] payees;
        uint[] shares;
    }

    RentalTerms public terms;
    address public tenant;
    RentStatus public status;
    uint public paymentCounter;
    string public review;

    uint public penaltySum;

    uint public renewalRequested;
    address public renewalRequester;

    constructor(address _cns, address _tenant, RentalTerms memory _terms) 
        PaymentSplitter(_terms.payees, _terms.shares, _cns) 
    {
        require(_terms.rentValue > 0, "RentalAgreement: rent value must be greater than 0");
        require(_terms.duration > 0, "RentalAgreement: duration must be greater than 0");
        require(_terms.earlyTerminationNotice <= _terms.duration, "RentalAgreement: early termination notice must be less or equal to duration");
        require(_tenant != address(0), "RentalAgreement: tenant address is zero");
        //require(_terms.startDate > block.timestamp - 1 hours, "RentalAgreement: start date must be in the future");

        tenant = _tenant;
        status = RentStatus.PENDING;
        terms = _terms;
    }

    function enroll() public onlyTenant {
        require(status == RentStatus.PENDING, "RentalAgreement: rent agreement is not active");
        IERC20(walletContractAddress()).transferFrom(tenant, address(this), terms.securityDeposit);
        status = RentStatus.ACTIVE;
    }

    function payRent() public active onlyTenant canPay {
        super.pay(terms.rentValue + penaltySum);
        penaltySum = 0;
        if (++paymentCounter == terms.duration) {
            status = RentStatus.COMPLETED;
        }
    }

    function conclude(uint _penalty) public onlyLandlord completed rentTimeOver {
        require(_penalty < terms.securityDeposit, "RentalAgreement: penalty must be less than the security deposit");
        uint remaining = terms.securityDeposit - _penalty;
        if (remaining > 0) {
            IERC20(walletContractAddress()).transfer(tenant, remaining);
        }
        if (_penalty > 0) {
            super.collect();
        }
        status = RentStatus.CONCLUDED;
    }

    function evict() public onlyLandlord active expired {
        require(block.timestamp - terms.startDate >= 1 days, "RentalAgreement: cannot dump tenant on first day");
        status = RentStatus.EVICTED;
        super.collect(); // security deposit splitted
    }

    function reduceTerm(uint _periods) public active onlyParties {
        require(terms.duration-paymentCounter-_periods >= terms.earlyTerminationNotice, "RentalAgreement: cannot reduce duration by more than early termination notice period");

        terms.duration -= _periods;

        if (msg.sender == tenant) {
            super.pay(terms.earlyTerminationFee);
        } else {
            IERC20(walletContractAddress()).transferFrom(terms.realtyContract, tenant, terms.earlyTerminationFee);
        }
    }

    function proposeRenewal(uint _periods) public completed onlyLandlord { 
        renewalRequested = _periods;
    }

    function acceptRenewal() public completed onlyTenant {
        require(renewalRequested > 0, "RentalAgreement: no renewal has been requested");
        terms.duration += renewalRequested;
        status = RentStatus.ACTIVE;
        renewalRequested = 0;
    }

    function writeReview(string memory _review) public onlyTenant {
        require(status == RentStatus.TERMINATED, "RentalAgreement: rent agreement is not completed");
        review = _review;
    }

    function paymentExpirationDate() public view returns (uint) {
        return terms.startDate + paymentCounter * PERIOD;
    }

    function _canEditPayees(address _operator) internal override view returns (bool) {
        return _operator == terms.realtyContract;
    }

    function getTerms() public view returns (RentalTerms memory) {
        return terms;
    }

    function collect() public override {
        require(status != RentStatus.ACTIVE, "RentalAgreement: rent agreement is still active");
        super.collect();
    }

    function pay(uint _amount) public pure override {
        require(false, "RentalAgreement: payment is not allowed");
    }
}