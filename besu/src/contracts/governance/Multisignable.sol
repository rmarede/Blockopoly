// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/governance/IMultisignable.sol";

contract Multisignable is IMultisignable {

    Policy public policy;

    constructor(Policy _policy) {
        policy = _policy;
    }

    function getMultisigPolicy() public view override returns (Policy) {
        return policy;
    }

    function setMultisigPolicy(Policy _policy) public virtual {
        require(msg.sender == address(this), "Multisignable: Permission denied");
        policy = _policy;
    }

    function getMultisignableName() public pure virtual override returns (string memory) {
        return "Multisignable";
    }

}