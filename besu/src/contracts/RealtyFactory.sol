// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownership.sol";
import "./utils/Arraysz.sol";
import "./utils/Context.sol";
import "./interface/permissioning/IRoleRegistry.sol";
import "./interface/permissioning/IAccountRegistry.sol";

// Ownership Factory
contract RealtyFactory is Context {

    struct RealtyDetails {
        string name; 
        address ownership;
        string district;
        uint postalCode;
        string street;
        uint number;
        uint totalArea;
    }

    address[] public registry;
    mapping(address => RealtyDetails) public realties;
    mapping(address => address[]) public realtiesOf;

    constructor(address _cns) Context(_cns) {}

    function mint(RealtyDetails memory _details, address[] memory _owners, uint[] memory _shares) public returns (address) {
        require(IRoleRegistry(roleRegistryAddress()).canMintRealties(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "Realties: sender does not have permission to mint");

        Ownership newOwnershipContract = new Ownership(_owners, _shares);
        address addr = address(newOwnershipContract);
        _details.ownership = addr;
        registry.push(addr);
        realties[addr] = _details;

        for (uint i = 0; i < _owners.length; i++) {
            realtiesOf[_owners[i]].push(addr);
        }
        return addr;
    }

    function getRealtiesOf(address _user) public view returns (address[] memory) {
        return realtiesOf[_user];
    }

    function addOwnership(address _assetId, address _user) public {
        require(msg.sender == realties[_assetId].ownership, "Realties: function restricted to ownership contract");
        require(!Arraysz.arrayContains(realtiesOf[_user], _assetId), "Realties: user already owns this asset");
        realtiesOf[_user].push(_assetId);
    }

    function removeOwnership(address _assetId, address _user) public {
        require(msg.sender == realties[_assetId].ownership, "Realties: function restricted to ownership contract");
        realtiesOf[_user] = Arraysz.remove(realtiesOf[_user], _assetId);
    }


}