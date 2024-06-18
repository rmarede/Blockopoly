// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum Policy { MAJORITY, UNANIMOUS, MAJORITY_OR_ADMIN, UNANIMOUS_OR_ADMIN }

interface IMultisignable {
    function getMultisigPolicy() external view returns (Policy);
    function getMultisignableName() external view returns (string memory);
}