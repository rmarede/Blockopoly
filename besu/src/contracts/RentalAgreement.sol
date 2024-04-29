// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./finance/PaymentSplitter.sol";
import "./Ownership.sol";

// TODO escrever as clausulas qualitativas do contrato em comentarios?

contract RentalAgreement is PaymentSplitter {

    modifier expired() { // TODO a usar para funcoes tipo force terminate
        require(block.timestamp - paymentExpirationDate() >= PERIOD, "RentalAgreement: period has not passed since last payment");
        _;
    }

    modifier canPay() {
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

    modifier onlyOwnershipContract() {
        require(msg.sender == terms.realtyContract, "RentalAgreement: only ownership contract can call this function");
        _;
    }

    modifier onlyParties() {
        require(msg.sender == terms.realtyContract || msg.sender == tenant, "Only landlord or tenant can call this.");
        _;
    }

    enum RentStatus { ACTIVE, COMPLETED, TERMINATED, DUMPED }
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
        status = RentStatus.ACTIVE;
        terms = _terms;
    }

    function pay(uint _amount) public override active onlyTenant canPay {
        require(_amount == terms.rentValue, "RentalAgreement: incorrect payment amount");
        super.pay(_amount);

        if (++paymentCounter == terms.duration) {
            status = RentStatus.COMPLETED;
        }
    }

    function terminate(uint _penalty) public onlyOwnershipContract completed rentTimeOver {
        require(_penalty < terms.securityDeposit, "RentalAgreement: penalty must be less than the security deposit");
        require(msg.sender == terms.realtyContract, "RentalAgreement: only Ownership contract can terminate the agreement");
        status = RentStatus.TERMINATED;

        uint remaining = terms.securityDeposit - _penalty;

        if (remaining > 0) {
            IERC20(walletContractAddress()).transfer(tenant, remaining);
        }

        if (_penalty > 0) {
            super.payFrom(address(this), _penalty);
        }
    }

    function dump() public onlyOwnershipContract active expired {
        require(block.timestamp - terms.startDate >= 1 days, "RentalAgreement: cannot dump tenant on first day");
        status = RentStatus.DUMPED;
        super.payFrom(address(this), terms.securityDeposit); // security deposit splitted
    }

    function reduceDuration(uint _periods) public active {
        require(msg.sender == tenant || msg.sender == terms.realtyContract, "RentalAgreement: only tenant or landlords can reduce duration");
        require(terms.duration-paymentCounter-_periods >= terms.earlyTerminationNotice, "RentalAgreement: cannot reduce duration by more than early termination notice period");

        terms.duration -= _periods;

        if (msg.sender == tenant) {
            super.pay(terms.earlyTerminationFee);
        } else {
            IERC20(walletContractAddress()).transferFrom(terms.realtyContract, tenant, terms.earlyTerminationFee);
        }
    }

    function requestRenewal(uint _periods) public completed onlyParties { 
        renewalRequested = _periods;
        renewalRequester = msg.sender;
    }

    function approveRenewal() public onlyParties {
        require(renewalRequested > 0, "RentalAgreement: no renewal has been requested");
        require(renewalRequester != msg.sender, "RentalAgreement: cannot approve own request");
        terms.duration += renewalRequested;
        status = RentStatus.ACTIVE;
        renewalRequested = 0;
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
}