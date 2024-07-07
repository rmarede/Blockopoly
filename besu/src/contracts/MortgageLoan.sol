// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./governance/WeightedMultiSig.sol";
import "./interface/IERC20.sol"; 

// TODO opcionais: fiador

contract MortgageLoan is WeightedMultiSig, Context {

    event LoanEnrolled(address indexed lender, address indexed borrower);
    event LoanSecured(address indexed lender, address indexed borrower);
    event LoanAmortized(address indexed lender, address indexed borrower);
    event LoanTerminated(address indexed lender, address indexed borrower);
    event LoanForeclosed(address indexed lender, address indexed borrower);

    modifier tbd() {
        require(status == Status.TBD, "MortgageLoan: Loan process already initialized");
        _;
    }

    modifier pending() {
        require(status == Status.PENDING, "MortgageLoan: Loan not pending");
        _;
    }

    modifier active() {
        require(status == Status.ACTIVE && paymentCounter < details.loanTerm, "MortgageLoan: Loan not active or already paid off");
        _;
    }

    modifier completed() {
        require(status == Status.ACTIVE && paymentCounter == details.loanTerm, "MortgageLoan: Loan not completed");
        _;
    }

    modifier onlyBorrower() {
        require(msg.sender == details.borrower, "MortgageLoan: Permission denied: borrower only");
        _;
    }

    modifier onlyLender() {
        require(msg.sender == details.lender, "MortgageLoan: Permission denied: lender only");
        _;
    }

    struct LoanDetails {
        address lender;
        address borrower;
        uint principal;
        uint downPayment;
        uint interestRate; // monthly, 2 decimals -> 1 = 1% (0.01)
        uint loanTerm;  // number of payments
        uint startDate;
        uint gracePeriod; // in days
        uint latePaymentFee;
        uint defaultDeadline; // in days
    }

    enum Status { TBD, PENDING, ACTIVE, TERMINATED, FORECLOSURED }
    uint public constant PERIOD = 30 days;
    
    uint public paymentCounter;
    LoanDetails public details;
    Status public status;

    constructor(address _cns, LoanDetails memory _details) 
        WeightedMultiSig(_participant(_details.borrower), _shares(1), Policy.UNANIMOUS) 
        Context(_cns)
    {
        require(_details.defaultDeadline > _details.gracePeriod, "MortgageLoan: Default deadline must be greater than grace period");
        details = _details;
        paymentCounter = 0;
        status = Status.TBD; 
    }

    function enroll() public onlyBorrower tbd {
        IERC20(walletContractAddress()).transferFrom(details.borrower, address(this), details.downPayment);
        status = Status.PENDING;
        emit LoanEnrolled(details.lender, details.borrower);
    }

    function secure() public onlyLender pending {
        IERC20(walletContractAddress()).transferFrom(details.lender, address(this), details.principal);
        super.addShares(details.lender, details.loanTerm);
        status = Status.ACTIVE;
        emit LoanSecured(details.lender, details.borrower);
    }

    function amortization() public view returns (uint) { // currently min 1%
        uint numerator = details.principal * details.interestRate * (100 + details.interestRate) ** details.loanTerm;
        uint denominator = ((100 + details.interestRate) ** details.loanTerm) - (100**details.loanTerm);
        uint res = (numerator / denominator);
        return res / (100);

        /*uint numerator = details.principal * details.interestRate * (100 + details.interestRate) ** details.loanTerm;
        uint denominator = (100 * (100+details.interestRate)**details.loanTerm) - 10**8;
        return numerator / denominator;*/
    }

    function amortize() public onlyBorrower active {
        uint _amortization = amortization();
        uint _remaining = IERC20(walletContractAddress()).balanceOf(address(this));
        if (_remaining > _amortization) { // TODO not really necessary, mas ja agr fica bem
            IERC20(walletContractAddress()).transfer(details.lender, _amortization);
        } else if (_remaining > 0) {
            IERC20(walletContractAddress()).transfer(details.lender, _remaining);
            IERC20(walletContractAddress()).transferFrom(details.borrower, details.lender, _amortization - _remaining);
        } else {
            IERC20(walletContractAddress()).transferFrom(details.borrower, details.lender, _amortization);
        }
        paymentCounter++;
        _balanceEquity();
        emit LoanAmortized(details.lender, details.borrower);
        if (paymentCounter == details.loanTerm) {
            status = Status.TERMINATED;
            emit LoanTerminated(details.lender, details.borrower);
        }
    }

    function applyPenalty() public onlyLender active {
        require(block.timestamp > details.startDate + (paymentCounter*PERIOD) + (details.gracePeriod * 1 days), "MortgageLoan: Grace period not surpassed");
        details.interestRate++;
    }

    function foreclosure() public onlyLender active {
        require(block.timestamp > details.startDate + (paymentCounter*PERIOD) + (details.defaultDeadline * 1 days), "MortgageLoan: Default deadline not yet reached");
        super.transferShares(details.borrower, details.lender, super.shareOf(details.borrower));
        status = Status.FORECLOSURED;
        emit LoanForeclosed(details.lender, details.borrower);
    }

    function _balanceEquity() private {
        super.transferShares(details.lender, msg.sender, 1);
    } 

    function transferShares(address _from, address _to, uint _amount) public pure override {
        require(false, "Ownership: Operation not allowed");
    }

    function addShares(address to, uint amount) public pure override {
        require(false, "Ownership: Operation not allowed");
    }

    function removeShares(address from, uint amount) public pure override {
        require(false, "Ownership: Operation not allowed");
    }

    function _participant(address _lender) private pure returns (address[] memory) {
        address[] memory res = new address[](1);
        res[0] = _lender;
        return res;
    }

    function _shares(uint _principal) private pure returns (uint[] memory) {
        uint[] memory res = new uint[](1);
        res[0] = _principal;
        return res;
    }
    
}