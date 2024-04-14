// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../MortgageLoan.sol";

contract MortgageLoanFactory is Context {

    constructor(address _cns) Context(_cns) {}
    
    function createMortgageLoan() public view returns (address) { // TODO para se criar um mortgage loan, é necessario fazer approve da factory para ela criar um mortgage loan ja com o dinheiro -> mesma cena para a caucao!!
        require(msg.sender == msg.sender, "MortgageLoanFactory: only a bank entity may create mortgage loan agreements"); // TODO quando tiver orgs

        //require(walletContract().allowance(...) >= principal , "MortgageLoanFactory: insufficient funds to create mortgage loan agreement");

        return address(0);
    }
    
}