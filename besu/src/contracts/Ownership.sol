// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./governance/WeightedMultiSig.sol"; 
import "./Realties.sol"; 

// Multisig wallet (pattern) + fractional ownership
contract Ownership is WeightedMultiSig {

    mapping(address => address) private approvals;
    mapping(address => bool) private blacklist; // TODO ou é melhor uma whitelist? 
    address private REALTIES_ADDRESS;

    constructor(address[] memory _owners, uint[] memory _shares) 
        WeightedMultiSig(_owners, _shares, Policy.MAJORITY) 
    {
        require(_owners.length <= 100, "Max num of owners: 100");
        uint totalShares = 0;
        for (uint i = 0; i < _owners.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == 10000, "Total shares must be equal to 10000 (100%)");

        REALTIES_ADDRESS = msg.sender;
        blacklist[REALTIES_ADDRESS] = true; // TODO ou passar blacklist no contrutor?
    }

    function approvedOf(address _addr) public view returns (address) {
        return approvals[_addr];
    }

    function approve(address _addr) public {
        require(shareOf(msg.sender) > 0, "Permission denied");
        approvals[msg.sender] = _addr;
    }

    function transferShares(address _from, address _to, uint _amount) public override {
        // if no approval, only the owner can transfer shares; if there is an approval, only the operator (approved address) can transfer
        require(approvedOf(_from) == msg.sender|| (approvedOf(_from) == address(0) && msg.sender == _from));
        super.transferShares(_from, _to, _amount);
        if (shares[_from] == 0) {
            Realties(REALTIES_ADDRESS).removeOwnership(address(this), _from);
        }
        if (shares[_to] == _amount) {
            Realties(REALTIES_ADDRESS).addOwnership(address(this), _to);
        }
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public override returns (uint transactionId) {
        require(!blacklist[_destination], "Blacklisted address");
        return super.submitTransaction(_destination, _value, _data);
    }

    function addShares(address to, uint amount) public pure override {
        require(false, "Ownership: Operation not allowed");
    }

    function removeShares(address from, uint amount) public pure override {
        require(false, "Ownership: Operation not allowed");
    }

}