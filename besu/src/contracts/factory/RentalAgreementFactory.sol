// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../RentalAgreement.sol";
import "../Ownership.sol";
import "../governance/Multisignable.sol";

contract RentalAgreementFactory is Multisignable {

    event NewRentalAgreement(address indexed tenant, address indexed landlord, address indexed realty, address agreement);

    address private cns;

    mapping (address => address[]) public rentalsOf;

    constructor(address _cns) Multisignable(Policy.UNANIMOUS_OR_ADMIN) {
        cns = _cns;
    }

    function createRentalAgreement(address _tenant, RentalAgreement.RentalTerms memory _terms) public returns (address) {
        require(msg.sender == _terms.realtyContract, "RentAgreementFactory: only ownership contract can create rental agreements");
        // TODO validar se _realtyContract existe, senao o msg.sender podia atirar o proprio address e alugar se a si proprio
        // para isto, ou comunicar com o realties, ou fazer cast do _realtyContract para Ownership e fazer uma operacao

        if (_terms.payees.length == 0) {
            Ownership ownership = Ownership(_terms.realtyContract);
            _terms.payees = ownership.getParticipants();
            _terms.shares = new uint[](_terms.payees.length);
            for (uint i = 0; i < _terms.payees.length; i++) {
                _terms.shares[i] = ownership.shareOf(_terms.payees[i]);
            }
        }

        RentalAgreement agreement = new RentalAgreement(cns, _tenant, _terms);
        rentalsOf[_terms.realtyContract].push(address(agreement));
        rentalsOf[_tenant].push(address(agreement));
        emit NewRentalAgreement(_tenant, _terms.realtyContract, address(agreement), address(agreement));
        return address(agreement);
    }

    function getRentalsOf(address _account) public view returns (address[] memory) {
        return rentalsOf[_account];
    }
    
}