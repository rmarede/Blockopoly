// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownership.sol";
import "./utils/Context.sol";

contract Realties is Context {

    struct Realty {
        uint256 id;
        string name; 
        string description;
        address ownership;
        // TODO evey information relative to the realty here? ou document stuff?
    }

    mapping(uint256 => Realty) public realties;
    mapping(address => uint256[]) public realtiesOf;
    uint256 public totalRealties = 0;

    constructor(address _cns) Context(_cns) {}

    // TODO functions to get and change the properties of a realty, only callable by the ownership multissig wallet

    function ownershipAddress(uint256 _id) public view returns (address) {
        return realties[_id].ownership;
    }

    function _mint(string memory name, string memory description, address[] memory _owners, uint[] memory _shares) public {
        // TODO check if the caller is the from the appropriate organization

        uint256 id = totalRealties++;

        Ownership newOwnershipContract = new Ownership(cns_address, _owners, _shares);

        realties[id] = Realty({
            id: id,
            name: name,
            description: description,
            ownership: address(newOwnershipContract)
        });
    }


}