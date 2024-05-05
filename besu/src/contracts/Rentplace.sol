// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./utils/Arraysz.sol";
import "./RentalAgreement.sol";
import "./Ownership.sol";
import "./factory/RentalAgreementFactory.sol";


contract Rentplace is Context {

    uint public rentalCounter;
    mapping(uint => RentalAgreement.RentalTerms) public terms;
    uint[] public openRentals;
    mapping(address => address[]) public rentalsOf;

    mapping(uint => address[]) public tenantProposals;

    constructor(address _cns) Context(_cns) {}

    function addRental(RentalAgreement.RentalTerms memory _terms) public {
        require(msg.sender == _terms.realtyContract, "Rentplace: only ownership contract can create rental agreements");
        uint rentalId = rentalCounter++;
        terms[rentalId] = _terms;
        openRentals.push(rentalId);
    }

    function propose(uint _rentalId) public {
        require(msg.sender != terms[_rentalId].realtyContract, "Rentplace: ownership contract cannot propose to its own rental");
        // require é um utilizador cidadao actually
        // require que o msg.sender nao esta ja proposed
        // require que esteja nos openRentals
        tenantProposals[_rentalId].push(msg.sender);
    }

    function accept(uint _rentalId, address _tenant) public returns (address){
        require(msg.sender == terms[_rentalId].realtyContract, "Rentplace: only ownership contract can accept proposals");
        // require que o tenant esta na lista de propostas
        RentalAgreement agreement = new RentalAgreement(cns_address, _tenant, terms[_rentalId]);
        rentalsOf[_tenant].push(address(agreement));
        rentalsOf[terms[_rentalId].realtyContract].push(address(agreement));
        delete terms[_rentalId];
        openRentals = Arraysz.remove(openRentals, _rentalId); // TODO nao sei se e preciso openRentals = ... , confirmar dps nos testes
        return address(agreement);
    }

    function cancel(uint _rentalId) public {
        require(msg.sender == terms[_rentalId].realtyContract, "Rentplace: only ownership contract can cancel rentals");
        // require que esteja nos openRentals
        delete terms[_rentalId];
        openRentals = Arraysz.remove(openRentals, _rentalId);
    }

}