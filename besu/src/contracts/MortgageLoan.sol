// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./governance/WeightedMultiSig.sol";

// TODO opcionais: LTV ratio, fiador, equity

// Equity refers to the portion of the property's value that the homeowner actually owns outright. 
// It is the difference between the property's current market value and the amount the homeowner owes on the mortgage. 
// Equity can increase in two ways:
//      As the mortgage principal is paid down
//      Through appreciation of property value -> not considered

// Amortization is the process of paying off a debt with a fixed repayment schedule in regular installments over time.

contract MortgageLoan is WeightedMultiSig, Context {

    struct LoanDetails {
        address lender;
        address borrower;
        uint principal;
        uint downPayment;
        uint interestRate; // (100 for 1%)
        uint loanTerm;  // number of payments
    }
    
    uint public paymentCounter;
    address public bankEntity;
    LoanDetails public details;

    constructor(address _cns, address _bankEntity, LoanDetails memory _details) 
        WeightedMultiSig(_entities(_bankEntity, _details.lender), _shares(_details.principal, _details.downPayment), Policy.UNANIMOUS) 
        Context(_cns)
    {
        bankEntity = _bankEntity;
        details = _details;
        paymentCounter = 0;

    }

    function amortize() public {
        require(msg.sender == details.borrower, "MortgageLoan: Permission denied");
        require(paymentCounter < details.loanTerm, "MortgageLoan: Loan already paid off");
        uint amortizationValue = amortization();
        uint remaining = walletContract().balanceOf(address(this));
        if (remaining > amortizationValue) { // TODO not really necessary, mas ja agr fica bem
            walletContract().transfer(bankEntity, amortizationValue);
        } else if (remaining > 0) {
            walletContract().transfer(bankEntity, remaining);
            walletContract().transferFrom(details.lender, bankEntity, amortizationValue - remaining);
        } else {
            walletContract().transferFrom(details.lender, bankEntity, amortizationValue);
        }
        paymentCounter++;
        _balanceEquity();
    }

    function amortization() public view returns (uint) {
        uint aux = (1 + details.interestRate) ** details.loanTerm;
        return details.principal * details.interestRate * aux / (aux - 1);
    }

    function _balanceEquity() private {
        this.transferShares(bankEntity, msg.sender, amortization());
    }

    function _entities(address _bankEntity, address _lender) private pure returns (address[] memory) {
        address[] memory res = new address[](2);
        res[0] = _bankEntity;
        res[1] = _lender;
        return res;
    }

    function _shares(uint _principal, uint _downPayment) private pure returns (uint[] memory) {
        uint[] memory res = new uint[](2);
        res[0] = _principal;
        res[1] = _downPayment;
        return res;
    }

    
}