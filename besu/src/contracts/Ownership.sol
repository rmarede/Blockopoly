// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./governance/WeightedMultiSig.sol"; 
import "./Realties.sol"; 

// Multisig wallet (pattern) + fractional ownership
contract Ownership is WeightedMultiSig {

    mapping(address => address) private approvals;
    mapping(address => bool) private blacklist; // TODO ou é melhor uma whitelist? 
    address private REALTIES_ADDRESS;

    address public admin;

    constructor(address[] memory _owners, uint[] memory _shares) 
        WeightedMultiSig(_owners, _shares, Policy.MAJORITY) 
    {
        require(_owners.length <= 100, "Ownership: Max num of owners: 100");
        uint totalShares = 0;
        for (uint i = 0; i < _owners.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == 10000, "Ownership: Total shares must be equal to 10000 (100%)");

        REALTIES_ADDRESS = msg.sender;
        blacklist[REALTIES_ADDRESS] = true; // TODO ou passar blacklist no contrutor?
    }

    function approvedOf(address _addr) public view returns (address) {
        return approvals[_addr];
    }

    function approve(address _addr) public {
        require(shareOf(msg.sender) > 0, "Ownership: Permission denied");
        approvals[msg.sender] = _addr;
    }

    function setAdmin(address _admin) public onlySelf {
        require(shareOf(_admin) > 0, "Ownership: Invalid admin"); // TODO maybe not required?
        admin = _admin;
    }

    function transferShares(address _from, address _to, uint _amount) public override {
        // if no approval, only the owner can transfer shares; if there is an approval, only the operator (approved address) can transfer
        require(approvedOf(_from) == msg.sender || (approvedOf(_from) == address(0) && msg.sender == _from), "Ownership: Permission denied");
        super.transferShares(_from, _to, _amount);
        admin = address(0);
        if (shares[_from] == 0) {
            Realties(REALTIES_ADDRESS).removeOwnership(address(this), _from);
        }
        if (shares[_to] == _amount) {
            Realties(REALTIES_ADDRESS).addOwnership(address(this), _to);
        }
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public override returns (uint transactionId) {
        require(!blacklist[_destination], "Ownership: Blacklisted address");
        return super.submitTransaction(_destination, _value, _data);
    }

    function isConfirmed(uint _transactionId) public view override returns (bool) {
        // TODO Policy targetPolicy = Multisignable(transactions[_transactionId].destination).getMultisigPolicy();
        if (policy == Policy.MAJORITY_OR_ADMIN || policy == Policy.UNANIMOUS_OR_ADMIN) {
            return confirmations[_transactionId][admin];
        }        
        return super.isConfirmed(_transactionId);
    }

    function addShares(address _to, uint _amount) public pure override {
        require(false, "Ownership: Not allowed");
    }

    function removeShares(address _from, uint _amount) public pure override {
        require(false, "Ownership: Not allowed");
    }

}