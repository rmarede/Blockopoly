// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Multisignable.sol";

contract SelfMultisig {

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].value != 0);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    struct Transaction {
        uint value;
        bytes data;
        bool executed;
    }

    address[] public participants; 
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) internal confirmations;
    uint public transactionCount;
    Policy public policy;

    constructor(address[] memory _participants, Policy _policy)  {
        require(_participants.length > 0, "Multisig: No participants specified");
        policy = _policy;
        for (uint i=0; i<_participants.length; i++) {
            participants.push(_participants[i]);
        }
    }

    function submitTransaction(uint _value, bytes memory _data) public virtual returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint _transactionId) public transactionExists(_transactionId) {
        confirmations[_transactionId][msg.sender] = true;
        executeTransaction(_transactionId);
    }   

    function executeTransaction(uint _transactionId) public 
        notExecuted(_transactionId)
    {
        if (isConfirmed(_transactionId)) {
            Transaction storage txn = transactions[_transactionId];
            (bool success, ) = address(this).call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "Multisig: Transaction failed");
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

    function getConfirmationCount(uint _transactionId) public view returns (uint count) {
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

    function _isMultisignable(address _address) private view returns (bool) {
        try Multisignable(_address).getMultisigPolicy() returns (Policy) {
            return true;
        } catch {
            return false;
        }
    }

}
