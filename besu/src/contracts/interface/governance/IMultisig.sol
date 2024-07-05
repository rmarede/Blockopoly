// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMultisig {
    event MultisigTransaction(uint transactionId, address indexed destination);
    function confirmTransaction(uint _transactionId) external;
    function executeTransaction(uint _transactionId) external;
    function getConfirmationCount(uint _transactionId) external view returns (uint count);
    function getTransactionCount() external view returns (uint count);
    function hasConfirmed(uint _transactionId, address _participant) external view returns (bool);
    function getTransaction(uint _transactionId) external view returns (address, bytes memory, bool);
}