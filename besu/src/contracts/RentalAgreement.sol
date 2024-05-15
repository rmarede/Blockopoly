// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./finance/PaymentSplitter.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";

// TODO escrever as clausulas qualitativas do contrato em comentarios?

contract RentalAgreement is PaymentSplitter {

    event RentalEnrolled(address indexed tenant, address indexed landlord, address indexed realty);
    event RentalComplete(address indexed tenant, address indexed landlord, address indexed realty);
    event RentalTerminated(address indexed tenant, address indexed landlord, address indexed realty);
    event TermRenewed(address indexed tenant, address indexed landlord, address indexed realty);
    event TermReduced(address indexed tenant, address indexed landlord, address indexed realty);
    event SecurityDepositReturned(address indexed tenant, address indexed landlord, address indexed realty, uint value);
    event RentPayment(address indexed tenant, address indexed landlord, address indexed realty, uint value);


    modifier active() {
        require(status == RentStatus.ACTIVE, "RentalAgreement: rent agreement is not active");
        _;
    }

    modifier completed() {
        require(status == RentStatus.COMPLETE, "RentalAgreement: rent agreement is terminated, cancelled or is not yet completed");
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

    enum RentStatus { PENDING, ACTIVE, COMPLETE, TERMINATED}
    enum Action { RENEW, TERMINATE }
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

    uint public penaltySum;

    Action public tenantAction;
    Action public landlordAction;
    uint public actionParam;

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
        emit RentalEnrolled(tenant, terms.realtyContract, address(this));
        payRent();
    }

    function payRent() public active onlyTenant {
        require(paymentCounter == 0 || (block.timestamp >= terms.startDate + ((paymentCounter-1) * PERIOD)), "RentalAgreement: cannot pay rent yet");
        super.pay(terms.rentValue + penaltySum);
        penaltySum = 0;
        emit RentPayment(tenant, terms.realtyContract, address(this), terms.rentValue + penaltySum);
        if (++paymentCounter == terms.duration) {
            status = RentStatus.COMPLETE;
            emit RentalComplete(tenant, terms.realtyContract, address(this));
        }
    }

    function terminate() public onlyParties active {
        require(block.timestamp >= terms.startDate  + (terms.duration * PERIOD), "RentalAgreement: rent time is not over");
        if (msg.sender == tenant) {
            tenantAction = Action.TERMINATE;
        } else if (msg.sender == terms.realtyContract) {
            landlordAction = Action.TERMINATE;
        }

        if (tenantAction == Action.TERMINATE && landlordAction == Action.TERMINATE) {
            status = RentStatus.COMPLETE;
            emit RentalComplete(tenant, terms.realtyContract, address(this));
        }
    }

    function evict() public onlyLandlord active {
        require(block.timestamp - paymentDueDate() >= PERIOD, "RentalAgreement: period has not passed since last payment");
        status = RentStatus.COMPLETE;
        emit RentalComplete(tenant, terms.realtyContract, address(this));
    }

    function returnDeposit(uint _penalty) public onlyLandlord completed returns (uint) {
        require(_penalty < terms.securityDeposit, "RentalAgreement: penalty must be less than the security deposit");
        uint remaining = terms.securityDeposit - _penalty;
        if (remaining > 0) {
            IERC20(walletContractAddress()).transfer(tenant, remaining);
        }
        status = RentStatus.TERMINATED;
        if (_penalty > 0) {
            super.collect();
        }
        emit SecurityDepositReturned(tenant, terms.realtyContract, address(this), remaining);
        return remaining;
    }


    function reduceTerm(uint _periods) public active onlyParties {
        require(terms.duration-paymentCounter-_periods >= terms.earlyTerminationNotice, "RentalAgreement: cannot reduce duration by more than early termination notice period");

        terms.duration -= _periods;
        emit TermReduced(tenant, terms.realtyContract, address(this));

        if (msg.sender == tenant) {
            super.pay(terms.earlyTerminationFee);
        } else {
            IERC20(walletContractAddress()).transferFrom(terms.realtyContract, tenant, terms.earlyTerminationFee);
        }
    }

    function renewTerm(uint _periods) public completed onlyLandlord {
        if (msg.sender == tenant) {
            tenantAction = Action.RENEW;
        } else if (msg.sender == terms.realtyContract) {
            landlordAction = Action.RENEW;
            actionParam = _periods;
        }

        if (tenantAction == Action.RENEW && landlordAction == Action.RENEW) {
            terms.duration += actionParam;
            status = RentStatus.ACTIVE;
            actionParam = 0;
            emit TermRenewed(tenant, terms.realtyContract, address(this));
        }
    }

    /*function acceptRenewal() public completed onlyTenant {
        require(renewalRequested > 0, "RentalAgreement: no renewal has been requested");
        terms.duration += renewalRequested;
        status = RentStatus.ACTIVE;
        renewalRequested = 0;
    }*/

    function paymentDueDate() public view returns (uint) {
        return terms.startDate + paymentCounter * PERIOD;
    }

    function _canEditPayees(address _operator) internal override view returns (bool) {
        return _operator == terms.realtyContract;
    }

    function getTerms() public view returns (RentalTerms memory) {
        return terms;
    }

    function collect() public override returns (uint) {
        require(status != RentStatus.ACTIVE, "RentalAgreement: rent agreement is still active");
        return super.collect();
    }

    function pay(uint _amount) public pure override {
        require(false, "RentalAgreement: payment is not allowed");
    }
}