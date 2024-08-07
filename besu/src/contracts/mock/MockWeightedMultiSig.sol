// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../governance/Multisignable.sol";
import "../interface/governance/IMultisig.sol";

contract MockWeightedMultiSig is IMultisig, Multisignable {

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    address[] public mockParticipants;
    uint mockShare; 
    uint totalShares;
    uint public transactionCount;

    bool public mockSubmitTransaction = true;
    bool public mockExecuteTransaction = true;
    bool public mockIsConfirmed;

    uint public mockConfirmationCount;
    Transaction public mockTransaction;

    bool public mockHasConfirmed;

    bool public mockTransferShares = true;
    bool public mockAddShares = true;
    bool public mockRemoveShares = true;

    constructor (address[] memory _participants, uint[] memory _shares, Policy _policy) Multisignable(_policy) {
    }

    function getParticipants() public view returns (address[] memory) {
        return mockParticipants;
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public virtual returns (uint _transactionId) {
        require(mockSubmitTransaction, "MockWeightedMultiSig: Submit transaction failed");
        _transactionId = transactionCount;
        if (mockExecuteTransaction) {
            executeTransaction(_transactionId);
        }
    }

    function confirmTransaction(uint _transactionId) public override {
        if (mockExecuteTransaction) {
            executeTransaction(_transactionId);
        }
    }

    function executeTransaction(uint _transactionId) public override {
        require(mockExecuteTransaction, "MockWeightedMultiSig: Execute transaction failed");
        emit MultisigTransaction(_transactionId, address(0));
    }

    function isConfirmed(uint _transactionId) public view virtual returns (bool) {
        return mockIsConfirmed;
    }

    function getConfirmationCount(uint _transactionId) public view override returns (uint _count) {
        return mockConfirmationCount;
    }

    function getTransaction(uint _transactionId) public view override returns (address, bytes memory, bool) {
        return (mockTransaction.destination, mockTransaction.data, mockTransaction.executed);
    }

    function hasConfirmed(uint _transactionId, address _participant) public view override returns (bool) {
        return mockHasConfirmed;
    }

    function shareOf(address _owner) public view returns (uint) {
        return mockShare;
    }

    function transferShares(address _from, address _to, uint _amount) public virtual {
        require(mockTransferShares, "MockWeightedMultiSig: Transfer shares failed");
    }

    function addShares(address _to, uint _amount) public virtual {
        require(mockAddShares, "MockWeightedMultiSig: Add shares failed");
    }

    function removeShares(address _from, uint _amount) public virtual {
        require(mockRemoveShares, "MockWeightedMultiSig: Remove shares failed");
    }

    function getTransactionCount() public view override returns (uint) {
        return transactionCount;
    }

    function setMultisigPolicy(Policy _policy) public override {
        super.setMultisigPolicy(_policy);
    }

    function setMockParticipants(address[] memory _participants) public {
        mockParticipants = _participants;
    }

    function setMockShare(uint _share) public {
        mockShare = _share;
    }

    function setTotalShares(uint _totalShares) public {
        totalShares = _totalShares;
    }

    function setMockSubmitTransaction(bool _mockSubmitTransaction) public {
        mockSubmitTransaction = _mockSubmitTransaction;
    }

    function setMockExecuteTransaction(bool _mockExecuteTransaction) public {
        mockExecuteTransaction = _mockExecuteTransaction;
    }

    function setMockIsConfirmed(bool _mockIsConfirmed) public {
        mockIsConfirmed = _mockIsConfirmed;
    }

    function setMockConfirmationCount(uint _mockConfirmationCount) public {
        mockConfirmationCount = _mockConfirmationCount;
    }

    function setMockTransaction(Transaction memory _mockTransaction) public {
        mockTransaction = _mockTransaction;
    }

    function setMockHasConfirmed(bool _mockHasConfirmed) public {
        mockHasConfirmed = _mockHasConfirmed;
    }

    function setMockTransferShares(bool _mockTransferShares) public {
        mockTransferShares = _mockTransferShares;
    }

    function setMockAddShares(bool _mockAddShares) public {
        mockAddShares = _mockAddShares;
    }

    function setMockRemoveShares(bool _mockRemoveShares) public {
        mockRemoveShares = _mockRemoveShares;
    }

    function setTransactionCount(uint _count) public {
        transactionCount = _count;
    }

}