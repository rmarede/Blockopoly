pragma solidity ^0.8.0;


contract Realties {

    struct Realty {
        string id; // string? ou outra cena
        string name; 
        string description;
        address ownership;
        // TODO evey information relative to the realty here
    }

    mapping(string => Realty) private realties;

    // TODO functions to get and change the properties of a realty, only callable by the ownership multissig wallet

    function getOwnershipContract(string memory _id) public view returns (address) {
        return realties[_id].ownership;
    }

}