// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./RentalAgreement.sol";
import "./factory/RentalAgreementFactory.sol";

contract Rentplace is Context, RentalAgreementFactory {


    uint public rentalCounter;
    mapping(uint => RentalAgreement.RentalTerms) public terms;
    uint[] public openRentals; // Possivelmente remover com a introducao de eventos, faz se esta logica no cliente?
    mapping(address => uint[]) public rentalsOfAsset;

    mapping(uint => uint[]) public tenantProposals;

    constructor(address _cns) Context(_cns) RentalAgreementFactory(_cns) {}

    function addRental(address _assetId, uint _rentValue) public {

    }

    function propose(address _rentalId) public {

    }

    function accept(address _rentalId, address _tenant) public {

    }

    function cancel(address _rentalId) public {

    }

    

}