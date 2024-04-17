// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Multisignable {

    enum Policy { MAJORITY, UNANIMOUS, MAJORITY_OR_ADMIN, UNANIMOUS_OR_ADMIN } 

    Policy public policy;

    constructor(Policy _policy) {
        policy = _policy;
    }

    function getMultisigPolicy() public view returns (Policy) {
        return policy;
    }

}