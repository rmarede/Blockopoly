// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Multisignable.sol";
import "../interface/governance/IMultisig.sol";

contract SelfMultisig is IMultisig, Multisignable {

    modifier transactionExists(uint transactionId) {
        require(transactionId < transactionCount, "Multisig: Transaction does not exist");
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner], "Multisig: Transaction already confirmed");
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed, "Multisig: Transaction already executed");
        _;
    }

    modifier isParticipant() {
        require(participantExists(msg.sender), "Multisig: Permission denied");
        _;
    }

    struct Transaction {
        uint id;
        uint value;
        bytes data;
        bool executed;
    }

    address[] public participants; 
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) internal confirmations;
    uint public transactionCount;

    constructor(address[] memory _participants, Policy _policy) Multisignable(_policy)  {
        require(_participants.length > 0, "Multisig: No participants specified");
        for (uint i=0; i<_participants.length; i++) {
            participants.push(_participants[i]);
        }
    }

    function submitTransaction(uint _value, bytes memory _data) public virtual isParticipant returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            id: transactionId,
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        emit MultisigSubmission(transactionId, address(this));
        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint _transactionId) public override 
        isParticipant 
        transactionExists(_transactionId) 
        notConfirmed(_transactionId, msg.sender) 
    {
        confirmations[_transactionId][msg.sender] = true;
        executeTransaction(_transactionId);
    }   

    function executeTransaction(uint _transactionId) public override
        notExecuted(_transactionId)
    {
        if (isConfirmed(_transactionId)) {
            Transaction storage txn = transactions[_transactionId];
            (bool success, ) = address(this).call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "Multisig: Transaction failed");
            emit MultisigTransaction(_transactionId, address(this));
        }
    }

    function isConfirmed(uint _transactionId) public view returns (bool) {
        if (policy == Policy.MAJORITY || policy == Policy.MAJORITY_OR_ADMIN) {
            return getConfirmationCount(_transactionId) > participants.length / 2;
        } else if (policy == Policy.UNANIMOUS || policy == Policy.UNANIMOUS_OR_ADMIN) {
            for (uint i=0; i<participants.length; i++)
                if (!confirmations[_transactionId][participants[i]])
                    return false;
            return true;
        }
        return false;
    }

    function getConfirmationCount(uint _transactionId) public view override returns (uint count) {
        for (uint i=0; i<participants.length; i++)
            if (confirmations[_transactionId][participants[i]])
                count += 1;
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function addParticipant(address _participant) internal virtual {
        require(_participant != address(0), "Multisig: Invalid input");
        require(!participantExists(_participant), "Multisig: Participant already exists");
        participants.push(_participant);
    }

    function removeParticipant(address _participant) internal virtual {
        require(_participant != address(0), "Multisig: Invalid input");
        for (uint i=0; i<participants.length; i++) {
            if (participants[i] == _participant) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                return;
            }
        }
        revert();
    }

    function participantExists(address _participant) public view returns (bool) {
        for (uint i=0; i<participants.length; i++) {
            if (participants[i] == _participant) {
                return true;
            }
        }
        return false;
    }

    function getTransaction(uint _transactionId) public view override returns (address, bytes memory, bool) {
        require(_transactionId < transactionCount, "Multisig: Transaction does not exist");
        Transaction memory txn = transactions[_transactionId];
        return (address(this), txn.data, txn.executed);
    }

    function getTransactionCount() public view override returns (uint) {
        return transactionCount;
    }

    function hasConfirmed(uint _transactionId, address _participant) public view override returns (bool) {
        return confirmations[_transactionId][_participant];
    }

}
