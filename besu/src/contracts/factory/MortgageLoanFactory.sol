// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../MortgageLoan.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";
import "../interface/IERC20.sol";	

contract MortgageLoanFactory is Context {

    constructor(address _cns) Context(_cns) {}

    function createMortgageLoan(MortgageLoan.LoanDetails memory _details) public returns (address) { 
        require(IRoleRegistry(roleRegistryAddress()).canMintLoans(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "MortgageLoanFactory: sender does not have permission to mint");
        _details.lender = msg.sender;
        MortgageLoan mortgageLoan = new MortgageLoan(cns_address, _details);
        return address(mortgageLoan);
    }
    
}