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
        require(block.timestamp >= terms.startDate + ((paymentCounter-1) * PERIOD), "RentalAgreement: cannot pay yet");
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
        require(msg.sender == realtyContract, "RentalAgreement: only landlord can call this function");
        _;
    }

    modifier onlyParties() {
        require(msg.sender == realtyContract || msg.sender == tenant, "Only landlord or tenant can call this.");
        _;
    }

    enum RentStatus { ACTIVE, COMPLETED, TERMINATED, DUMPED }
    
    struct RentalTerms {
        uint rentValue;
        uint securityDeposit;
        uint startDate;
        uint duration; // in periods
        uint earlyTerminationFee;
        uint earlyTerminationNotice; // in periods
        string extra;
    }

    uint public constant PERIOD = 30 days;

    address realtyContract;
    address public tenant;
    RentStatus public status;
    uint public paymentCounter;
    RentalTerms public terms;

    uint public renewalRequested;
    address public renewalRequester;

    constructor(address _cns, address _realty, address _tenant, address[] memory _payees, uint[] memory _shares, RentalTerms memory _terms) 
        PaymentSplitter(_payees, _shares, _cns) 
    {
        require(_terms.rentValue > 0, "RentalAgreement: rent value must be greater than 0");
        require(_terms.duration > 0, "RentalAgreement: duration must be greater than 0");
        require(_terms.startDate > block.timestamp, "RentalAgreement: start date must be in the future");
        require(_terms.earlyTerminationNotice <= _terms.duration, "RentalAgreement: early termination notice must be less or equal to duration");
        require(_tenant != address(0), "RentalAgreement: tenant address is zero");

        realtyContract = _realty;
        tenant = _tenant;
        status = RentStatus.ACTIVE;
        terms = _terms;
    }

    /*
    constructor(address _cns, address _realty, address[] memory _payees, uint[] memory _shares, address _tenant, uint _rentValue, uint _securityDeposit, 
        uint _startDate, uint _duration, uint _earlyTerminationFee, uint _earlyTerminationNotice, string memory _extra) 
        PaymentSplitter(_payees, _shares, _cns) 
    {
        require(_rentValue > 0, "RentalAgreement: rent value must be greater than 0");
        require(duration > 0, "RentalAgreement: duration must be greater than 0");
        require(_startDate > block.timestamp, "RentalAgreement: start date must be in the future");
        require(_earlyTerminationNotice <= _duration, "RentalAgreement: early termination notice must be less or equal to duration");
        require(_tenant != address(0), "RentalAgreement: tenant address is zero"); // TODO - verificar se é da org correta

        realtyContract = _realty;
        tenant = _tenant;
        rentValue = _rentValue;
        securityDeposit = _securityDeposit;
        duration = _duration;
        startDate = _startDate;
        status = RentStatus.ACTIVE;
        earlyTerminationFee = _earlyTerminationFee;
        earlyTerminationNotice = _earlyTerminationNotice;
        extra = _extra;

    }*/

    function pay(uint _amount) public override active onlyTenant canPay {
        require(_amount == terms.rentValue, "RentalAgreement: incorrect payment amount");
        super.pay(_amount);

        if (++paymentCounter == terms.duration) {
            status = RentStatus.COMPLETED;
        }
    }

    function terminate(uint _penalty) public onlyLandlord completed rentTimeOver {
        require(_penalty < terms.securityDeposit, "RentalAgreement: penalty must be less than the security deposit");
        require(msg.sender == realtyContract, "RentalAgreement: only Ownership contract can terminate the agreement");
        status = RentStatus.TERMINATED;

        uint remaining = terms.securityDeposit - _penalty;

        if (remaining > 0) {
            _walletContract().transfer(tenant, remaining);
        }

        if (_penalty > 0) {
            super.payFrom(address(this), _penalty);
        }
    }

    function dump() public onlyLandlord active expired {
        require(block.timestamp - terms.startDate >= 1 weeks, "RentalAgreement: cannot dump tenant before 1 week of rent time has passed");
        status = RentStatus.DUMPED;
        super.payFrom(address(this), terms.securityDeposit); // security deposit splitted
    }

    function requestDurationReduction(uint _periods) public active {
        terms.duration -= _periods;
    }

    function reduceDuration(uint _periods) public active {
        require(msg.sender == tenant || msg.sender == realtyContract, "RentalAgreement: only tenant or landlords can reduce duration");
        require(terms.duration-paymentCounter-_periods >= terms.earlyTerminationNotice, "RentalAgreement: cannot reduce duration by more than early termination notice period");

        terms.duration -= _periods;

        if (msg.sender == tenant) {
            super.pay(terms.earlyTerminationFee);
        } else {
            _walletContract().transferFrom(realtyContract, tenant, terms.earlyTerminationFee);
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
        return _operator == realtyContract;
    }
}