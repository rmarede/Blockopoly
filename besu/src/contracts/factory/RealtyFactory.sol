// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Ownership.sol";
import "../utils/Arraysz.sol";
import "../utils/Context.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract RealtyFactory is Context {

    struct RealtyDetails {
        string name; 
        address ownership;
        string kind;
        string district;
        string location;
        string image;
        uint totalArea;
    }

    address[] public registry;
    mapping(address => RealtyDetails) public realties;
    mapping(address => address[]) public realtiesOf;

    constructor(address _cns) Context(_cns) {}

    function mint(RealtyDetails memory _details, address[] memory _owners, uint[] memory _shares) public returns (address) {
        address roleRegistry = roleRegistryAddress();
        if (roleRegistry != address(0)) {
            require(IRoleRegistry(roleRegistry).canMintRealties(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "RealtyFactory: sender does not have permission to mint");
        }
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

    function detailsOf(address _assetId) public view returns (RealtyDetails memory) {
        return realties[_assetId];
    }

    function kindOf(address _assetId) public view returns (string memory) {
        return realties[_assetId].kind;
    }

    function addOwnership(address _assetId, address _user) public {
        require(msg.sender == realties[_assetId].ownership, "RealtyFactory: function restricted to ownership contract");
        require(!Arraysz.arrayContains(realtiesOf[_user], _assetId), "RealtyFactory: user already owns this asset");
        realtiesOf[_user].push(_assetId);
    }

    function removeOwnership(address _assetId, address _user) public {
        require(msg.sender == realties[_assetId].ownership, "RealtyFactory: function restricted to ownership contract");
        realtiesOf[_user] = Arraysz.remove(realtiesOf[_user], _assetId);
    }


}