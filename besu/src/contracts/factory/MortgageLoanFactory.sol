// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../MortgageLoan.sol";

contract MortgageLoanFactory {

    address private cns;

    constructor(address _cns) {
        cns = _cns;
    }
    
    function createMortgageLoan() public view returns (address) {
        require(msg.sender == msg.sender, "MortgageLoanFactory: only a bank entity may create mortgage loan agreements"); // TODO quando tiver orgs
        return address(0);
    }
    
}