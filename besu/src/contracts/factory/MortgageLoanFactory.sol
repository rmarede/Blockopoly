// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../MortgageLoan.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract MortgageLoanFactory is Context {

    constructor(address _cns) Context(_cns) {}

    mapping (address => address[]) public mortgagesOf;

    function createMortgageLoan(MortgageLoan.LoanDetails memory _details) public returns (address) { 
        require(IRoleRegistry(roleRegistryAddress()).canMintLoans(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "MortgageLoanFactory: sender does not have permission to mint");
        _details.lender = msg.sender;
        MortgageLoan mortgageLoan = new MortgageLoan(cns_address, _details);
        mortgagesOf[_details.borrower].push(address(mortgageLoan));
        mortgagesOf[_details.lender].push(address(mortgageLoan));
        return address(mortgageLoan);
    }
    
    function getMortgagesOf(address _account) public view returns (address[] memory) {
        return mortgagesOf[_account];
    }
}