// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MockWeightedMultiSig.sol"; 

contract MockOwnership is MockWeightedMultiSig {

    event OwnershipTransfer(address indexed from, address indexed to, uint amount);

    address public mockApprovedOf;
    bool public mockApprove;

    address public admin;

    constructor(address[] memory _owners, uint[] memory _shares) 
        MockWeightedMultiSig(_owners, _shares, Policy.MAJORITY) 
    {    }

    function approvedOf(address _addr) public view returns (address) {
        return mockApprovedOf;
    }

    function approve(address _addr) public {
        require(mockApprove, "Ownership: Approve failed");
    }

    function setAdmin(address _admin) public {
        admin = _admin;
    }

    function transferShares(address _from, address _to, uint _amount) public override {
        super.transferShares(_from, _to, _amount);
        emit OwnershipTransfer(_from, _to, _amount);
    }

    function addShares(address _to, uint _amount) public pure override {
        require(false, "Ownership: Not allowed");
    }

    function removeShares(address _from, uint _amount) public pure override {
        require(false, "Ownership: Not allowed");
    }

    function getMultisignableName() public pure override returns (string memory) {
        return "Ownership";
    }

}