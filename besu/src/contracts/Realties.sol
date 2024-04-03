// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownership.sol";
import "./utils/Context.sol";
import "./utils/Arraysz.sol";

// Ownership Factory
contract Realties is Context {

    struct Realty {
        string name; 
        string description;
        address ownership;
        // TODO evey information relative to the realty here? ou document stuff?
    }

    Realty[] public realties;
    mapping(address => uint) public indexOf;
    mapping(address => address[]) public realtiesOf;

    constructor(address _cns) Context(_cns) {}

    // TODO functions to get and change the properties of a realty, only callable by the ownership multissig wallet

    function mint(string memory name, string memory description, address[] memory _owners, uint[] memory _shares) public returns (address) {
        // TODO check if the caller is the from the appropriate organization

        Ownership newOwnershipContract = new Ownership(_owners, _shares);

        address addr = address(newOwnershipContract);

        realties.push(Realty({
            name: name,
            description: description,
            ownership: addr
        }));

        indexOf[addr] = realties.length - 1;

        for (uint i = 0; i < _owners.length; i++) {
            realtiesOf[_owners[i]].push(addr);
        }

        return addr;
    }

    function addOwnership(address _assetId, address _user) public { // TODO DANGER: owners podem votar para usar estas funcoes e estragarem coerencia...
        require(msg.sender == realties[indexOf[_assetId]].ownership, "Realties: function restricted to ownership contract");
        require(!Arraysz.arrayContains(realtiesOf[_user], _assetId), "Realties: user already owns this asset");
        realtiesOf[_user].push(_assetId);
    }

    function removeOwnership(address _assetId, address _user) public {
        require(msg.sender == realties[indexOf[_assetId]].ownership, "Realties: function restricted to ownership contract");
        realtiesOf[_user] = Arraysz.remove(realtiesOf[_user], _assetId);
    }


}