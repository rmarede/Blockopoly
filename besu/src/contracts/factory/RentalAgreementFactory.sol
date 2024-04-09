// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../RentalAgreement.sol";

contract RentalAgreementFactory {

    address private cns;

    constructor(address _cns) {
        cns = _cns;
    }
    
    function createRentalAgreement(address _tenant, RentalAgreement.RentalTerms memory _terms) public returns (address) {
        require(msg.sender == _terms.realtyContract, "RentAgreementFactory: only ownership contract can create rental agreements");
        RentalAgreement agreement = new RentalAgreement(cns, _tenant, _terms);
        return address(agreement);
    }
    
}