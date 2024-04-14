// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./governance/WeightedMultiSig.sol";
import "./Ownership.sol";

// TODO opcionais: fiador

contract MortgageLoan is WeightedMultiSig, Context {

    modifier tbd() {
        require(state == State.TBD, "MortgageLoan: Loan process already initialized");
        _;
    }

    modifier pending() {
        require(state == State.PENDING, "MortgageLoan: Loan not pending");
        _;
    }

    modifier active() {
        require(state == State.ACTIVE && paymentCounter < details.loanTerm, "MortgageLoan: Loan not active or already paid off");
        _;
    }

    modifier completed() {
        require(state == State.ACTIVE && paymentCounter == details.loanTerm, "MortgageLoan: Loan not completed");
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
        uint interestRate; // monthly, (100 for 1%) - 2 decimals
        uint loanTerm;  // number of payments
        uint startDate;
        uint gracePeriod; 
        uint latePaymentFee;
        uint defaultDeadline;
    }

    enum State { TBD, PENDING, ACTIVE, TERMINATED, FORECLOSURED }
    uint public constant PERIOD = 30 days;
    
    uint public paymentCounter;
    LoanDetails public details;
    State public state;

    constructor(address _cns, LoanDetails memory _details) 
        WeightedMultiSig(_participant(_details.lender), _shares(_details.principal), Policy.UNANIMOUS) 
        Context(_cns)
    {
        details = _details;
        paymentCounter = 0;
        state = State.TBD; 
    }

    function init() public onlyLender tbd {
        walletContract().transferFrom(details.lender, address(this), details.principal);
        state = State.PENDING;
    }

    function enroll() public onlyBorrower pending {
        require(walletContract().balanceOf(address(this)) >= details.principal, "MortgageLoan: Principal not fully funded");
        walletContract().transferFrom(details.borrower, address(this), details.downPayment);
        super.addShares(details.borrower, details.downPayment);
        state = State.ACTIVE;
    }

    function amortization() public view returns (uint) { // currently min 1%
        uint numerator = details.principal * details.interestRate * (100 + details.interestRate) ** details.loanTerm;
        uint denominator = ((100 + details.interestRate) ** details.loanTerm) - (100**details.loanTerm);
        uint res = (numerator / denominator);
        return res / (10000);

        /*
        uint numerator = details.interestRate * (1 + details.interestRate) ** details.loanTerm;
        uint denominator = (1 + details.interestRate) ** details.loanTerm - 1;

        return details.principal * (numerator / denominator);
        */

    }

    function amortize() public onlyBorrower active {
        uint _amortization = amortization();
        uint _remaining = walletContract().balanceOf(address(this));
        if (_remaining > _amortization) { // TODO not really necessary, mas ja agr fica bem
            walletContract().transfer(details.lender, _amortization);
        } else if (_remaining > 0) {
            walletContract().transfer(details.lender, _remaining);
            walletContract().transferFrom(details.borrower, details.lender, _amortization - _remaining);
        } else {
            walletContract().transferFrom(details.borrower, details.lender, _amortization);
        }
        paymentCounter++;
        _balanceEquity();
    }

    function terminate(address _asset, uint _share) public completed {
        Ownership(_asset).transferShares(address(this), details.borrower, _share);
        state = State.TERMINATED;
    }

    function applyPenalty() public onlyLender active { // preciso ter cuidado para nao estragar a equity, aumentar o interest?
        require(block.timestamp > details.startDate + (paymentCounter*PERIOD) + details.gracePeriod, "MortgageLoan: Grace period not reached");
    }

    function foreclosure(address _asset, uint _share) public onlyLender active {
        require(block.timestamp > details.startDate + (paymentCounter*PERIOD) + details.defaultDeadline, "MortgageLoan: Default deadline not reached");
        Ownership(_asset).transferShares(address(this), details.lender, _share);
        state = State.FORECLOSURED;
    }

    function _balanceEquity() private {
        super.transferShares(details.lender, msg.sender, details.principal / details.loanTerm);
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

    function _canTransferShares(address from, address operator) internal pure override returns (bool) {
        return true;
    }

    function _canAddShares(address operator) internal pure override returns (bool) {
        return true;
    }
    
}