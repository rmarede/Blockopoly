// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../MortgageLoan.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";
import "../interface/IERC20.sol";	

contract MortgageLoanFactory is Context {

    constructor(address _cns) Context(_cns) {}
    
    
    function createMortgageLoan(address _borrower, uint _principal, uint _downPayment, uint _interestRate, uint _loanTerm, uint _startDate, 
    uint _gracePeriod, uint _latePaymentFee, uint _defaultDeadline) public returns (address) { 

        require(IRoleRegistry(roleRegistryAddress()).canMintLoans(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "MortgageLoanFactory: sender does not have permission to mint");
        //require(IERC20(walletContractAddress()).allowance(msg.sender, address(this)) >= _principal , "MortgageLoanFactory: insufficient funds to create mortgage loan agreement");
        // TODO para se criar um mortgage loan, é necessario fazer approve da factory para ela criar um mortgage loan ja com o dinheiro -> assim init() deixa de ser necessario

        MortgageLoan.LoanDetails memory details = MortgageLoan.LoanDetails({
            lender: msg.sender,
            borrower:_borrower,
            principal: _principal,
            downPayment: _downPayment,
            interestRate: _interestRate,
            loanTerm: _loanTerm,
            startDate: _startDate,
            gracePeriod: _gracePeriod,
            latePaymentFee: _latePaymentFee,
            defaultDeadline: _defaultDeadline
        });

        MortgageLoan mortgageLoan = new MortgageLoan(cns_address, details);
        return address(mortgageLoan);
    }
    
}