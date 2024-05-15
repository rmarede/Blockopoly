// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Multisignable.sol";

// WIGHTED MULTI SIGNATURE WALLET PATTERN IMPLEMENTATION
// github.com/OpenZeppelin/gnosis-multisig -> TODO maybe upgrade com openzeppelin Governor.sol
contract WeightedMultiSig is Multisignable {

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0), "WeightedMultiSig: Transaction does not exist");
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner], "WeightedMultiSig: Transaction not confirmed");
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner], "WeightedMultiSig: Transaction already confirmed");
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed, "WeightedMultiSig: Transaction already executed");
        _;
    }

    modifier isOwner(address addr) {
        require(shares[msg.sender] > 0, "WeightedMultiSig: Permission denied");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "WeightedMultiSig: Permission denied");
        _;
    }

    address[] public participants; // TODO sera que queremos isto visivel para todos?
    mapping (address => uint) internal shares; // TODO mudar nome para weight ou algo do genero
    uint totalShares;

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) internal confirmations;
    uint public transactionCount;

    constructor (address[] memory _participants, uint[] memory _shares, Policy _policy) Multisignable(_policy){
        require(_participants.length > 0, "WeightedMultiSig: No participants specified");
        require(_participants.length == _shares.length, "WeightedMultiSig: Invalid input");
        for (uint i=0; i<_participants.length; i++) {
            require(_participants[i] != address(0) && _shares[i] > 0, "WeightedMultiSig: Invalid input");
            participants.push(_participants[i]);
            shares[_participants[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function changePolicy(string memory _policy) public onlySelf {
        if (keccak256(abi.encodePacked(_policy)) == keccak256(abi.encodePacked("MAJORITY"))) {
            policy = Policy.MAJORITY;
        } else if (keccak256(abi.encodePacked(_policy)) == keccak256(abi.encodePacked("UNANIMOUS"))) {
            policy = Policy.UNANIMOUS;
        } else {
            revert("WeightedMultiSig: Invalid policy");
        }
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public virtual isOwner(msg.sender) returns (uint _transactionId) {
        _transactionId = transactionCount;
        transactions[_transactionId] = Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        confirmTransaction(_transactionId);
    }

    function confirmTransaction(uint _transactionId) public 
        isOwner(msg.sender) 
        transactionExists(_transactionId) 
        notConfirmed(_transactionId, msg.sender) 
    {
        confirmations[_transactionId][msg.sender] = true;
        executeTransaction(_transactionId);
    }

    function executeTransaction(uint _transactionId) public 
        isOwner(msg.sender)
        confirmed(_transactionId, msg.sender)
        notExecuted(_transactionId)
    {
        if (isConfirmed(_transactionId)) {
            Transaction storage txn = transactions[_transactionId];
            (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "WeightedMultiSig: Transaction failed");
        }
    }

    function isConfirmed(uint _transactionId) public view virtual returns (bool) {
        // TODO Policy targetPolicy = Multisignable(transactions[_transactionId].destination).getMultisigPolicy();
        if (policy == Policy.MAJORITY || policy == Policy.MAJORITY_OR_ADMIN) {
            return getConfirmationCount(_transactionId) > totalShares / 2;
        } else if (policy == Policy.UNANIMOUS || policy == Policy.UNANIMOUS_OR_ADMIN) {
            for (uint i=0; i<participants.length; i++)
                if (!confirmations[_transactionId][participants[i]])
                    return false;
            return true;
        }
        return false;
    }

    function getConfirmationCount(uint _transactionId) public view returns (uint _count) {
        for (uint i=0; i<participants.length; i++)
            if (confirmations[_transactionId][participants[i]])
                _count += shares[participants[i]];
    }

    function shareOf(address _owner) public view returns (uint) {
        return shares[_owner];
    }

    function transferShares(address _from, address _to, uint _amount) public virtual {
        require(shares[_from] >= _amount, "WeightedMultiSig: Not enough shares");

        if (shares[_to] == 0) { 
            participants.push(_to);
        }

        shares[_from] -= _amount;
        shares[_to] += _amount;

        if (shares[_from] == 0) { 
            for (uint i = 0; i < participants.length; i++) {
                if (participants[i] == _from) {
                    participants[i] = participants[participants.length - 1];
                    participants.pop();
                    break;
                }
            }
        }
    }

    function addShares(address _to, uint _amount) public virtual {
        if (shares[_to] == 0) {  
            participants.push(_to);
        }
        shares[_to] = _amount;
        totalShares += _amount;
    }

    function removeShares(address _from, uint _amount) public virtual {
        require(shares[_from] > _amount, "WeightedMultiSig: Not enough shares");
        shares[_from] -= _amount;
        totalShares -= _amount;
        if (shares[_from] == 0) { 
            for (uint i = 0; i < participants.length; i++) {
                if (participants[i] == _from) {
                    participants[i] = participants[participants.length - 1];
                    participants.pop();
                    break;
                }
            }
        }
    }

}