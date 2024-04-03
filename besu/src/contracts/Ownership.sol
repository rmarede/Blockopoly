// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./governance/WeightedMultiSig.sol"; 
import "./Realties.sol"; 

// Multisig wallet (pattern) + fractional ownership
contract Ownership is WeightedMultiSig {

    mapping(address => address) private approvals;
    address[] private blacklist;

    constructor(address[] memory _owners, uint[] memory _shares) 
        WeightedMultiSig(_owners, _shares, Policy.MAJORITY) 
    {
        require(_owners.length <= 100, "Max num of owners: 100");
        uint totalShares = 0;
        for (uint i = 0; i < _owners.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == 100, "Total shares must be equal to 100");

        blacklist.push(msg.sender); // TODO ou passar blacklist no contrutor?
    }

    function approvedOf(address _addr) public view returns (address) {
        return approvals[_addr];
    }

    function approve(address _addr) public {
        require(shareOf(msg.sender) > 0, "Permission denied");
        approvals[msg.sender] = _addr;
    }

    function transferShares(address _from, address _to, uint _amount) public override {
        super.transferShares(_from, _to, _amount);
        if (shares[_from] == 0) {
            Realties(blacklist[0]).removeOwnership(address(this), _from);
        }
        if (shares[_to] == _amount) {
            Realties(blacklist[0]).addOwnership(address(this), _from);
        }
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public override returns (uint transactionId) {
        require(!isBlacklisted(_destination), "Blacklisted address");
        return super.submitTransaction(_destination, _value, _data);
    }

    function canTransferShares(address _from, address _operator) public override view returns (bool) {
        // if no approval, only the owner can transfer shares; if there is an approval, only the operator (approved address) can transfer
        return approvedOf(_from) == _operator|| (approvedOf(_from) == address(0) && _operator == _from);
    }

    function isBlacklisted(address _addr) public view returns (bool) {
        for (uint i = 0; i < blacklist.length; i++) {
            if (blacklist[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function canAddShares(address operator) public pure override returns (bool) {
        return false;
    }

    function canRemoveShares(address operator) public pure override returns (bool) {
        return false;
    }

}