// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrganizationMultiSig {

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0));
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }
    
    enum Policy { MAJORITY, UNANIMOUS } 

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    string[] public participants;

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) internal confirmations;
    uint public transactionCount;
    Policy public policy;

}
