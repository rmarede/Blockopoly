// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Multisignable.sol";
import "../utils/Strings.sol";

contract OrganizationMultiSig is Multisignable {

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0));
        _;
    }

    modifier notConfirmed(uint transactionId, string memory participant) {
        require(!confirmations[transactionId][participant]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    string[] public participants; // podem nao ser todas as orgs... pode haver orgs sem voting rights

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (string => bool)) internal confirmations;
    uint public transactionCount;

    constructor(string[] memory _participants, Policy _policy) Multisignable(_policy) {
        require(_participants.length > 0, "OrganizationMultiSig: No participants specified");
        policy = _policy;
        for (uint i=0; i<_participants.length; i++) {
            require(!Strings.equals(_participants[i], ""), "OrganizationMultiSig: Invalid input");
            participants.push(_participants[i]);
        }
    }

    function submitTransaction(string memory _participant, address _destination, uint _value, bytes memory _data) public virtual returns (uint transactionId) {
        require(_isMultisignable(_destination), "OrganizationMultiSig: Target is not multisignable");
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        confirmTransaction(transactionId, _participant);
    }

    function confirmTransaction(uint _transactionId, string memory _participant) public 
        transactionExists(_transactionId) 
        notConfirmed(_transactionId, _participant) 
    {
        confirmations[_transactionId][_participant] = true;
        executeTransaction(_transactionId);
    }

    function executeTransaction(uint _transactionId) public 
        notExecuted(_transactionId)
    {
        if (isConfirmed(_transactionId)) {
            Transaction storage txn = transactions[_transactionId];
            (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "OrganizationMultiSig: Transaction failed");
        }
    }

    function isConfirmed(uint _transactionId) public view returns (bool) {
        Policy targetPolicy = Multisignable(transactions[_transactionId].destination).getMultisigPolicy();
        if (targetPolicy == Policy.MAJORITY) {
            return getConfirmationCount(_transactionId) > participants.length / 2;
        } else if (targetPolicy == Policy.UNANIMOUS) {
            for (uint i=0; i<participants.length; i++)
                if (!confirmations[_transactionId][participants[i]])
                    return false;
            return true;
        }
    }

    function getConfirmationCount(uint _transactionId) public view returns (uint count) {
        for (uint i=0; i<participants.length; i++)
            if (confirmations[_transactionId][participants[i]])
                count += 1;
    }

    function getParticipants() public view returns (string[] memory) {
        return participants;
    }

    function addParticipant(string memory _participant) public {
        require(msg.sender == address(this), "OrganizationMultiSig: Unauthorized");
        require(!Strings.equals(_participant, ""), "OrganizationMultiSig: Invalid input");
        require(!participantExists(_participant), "OrganizationMultiSig: Participant already exists");
        participants.push(_participant);
    }

    function removeParticipant(string memory _participant) public {
        require(msg.sender == address(this), "OrganizationMultiSig: Unauthorized");
        require(!Strings.equals(_participant, ""), "OrganizationMultiSig: Invalid input");
        for (uint i=0; i<participants.length; i++) {
            if (Strings.equals(participants[i], _participant)) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
    }

    function participantExists(string memory _participant) public view returns (bool) {
        for (uint i=0; i<participants.length; i++) {
            if (Strings.equals(participants[i], _participant)) {
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
