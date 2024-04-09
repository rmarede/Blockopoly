// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../RentalAgreement.sol";
import "../Ownership.sol";

contract RentalAgreementFactory {

    address private cns;

    constructor(address _cns) {
        cns = _cns;
    }

    function createRentalAgreement(address _tenant, address _realtyContract, uint _rentValue, uint _securityDeposit, uint _startDate, 
        uint _duration, uint _earlyTerminationFee, uint _earlyTerminationNotice, string memory _extra, address[] memory _payees, uint[] memory _shares) 
        public returns (address) 
    {
        require(msg.sender == _realtyContract, "RentAgreementFactory: only ownership contract can create rental agreements");

        if (_payees.length == 0) {
            Ownership ownership = Ownership(_realtyContract);
            _payees = ownership.getParticipants();
            _shares = new uint[](_payees.length);
            for (uint i = 0; i < _payees.length; i++) {
                _shares[i] = ownership.shareOf(_payees[i]);
            }
        }

        RentalAgreement.RentalTerms memory terms = RentalAgreement.RentalTerms({
            realtyContract: _realtyContract,
            rentValue: _rentValue,
            securityDeposit: _securityDeposit,
            startDate: _startDate,
            duration: _duration,
            earlyTerminationFee: _earlyTerminationFee,
            earlyTerminationNotice: _earlyTerminationNotice,
            extra: _extra,
            payees: _payees,
            shares: _shares
        });

        RentalAgreement agreement = new RentalAgreement(cns, _tenant, terms);
        return address(agreement);
    }

    function createRentalAgreement(address _tenant, RentalAgreement.RentalTerms memory _terms) public returns (address) {
        require(msg.sender == _terms.realtyContract, "RentAgreementFactory: only ownership contract can create rental agreements");

        if (_terms.payees.length == 0) {
            Ownership ownership = Ownership(_terms.realtyContract);
            _terms.payees = ownership.getParticipants();
            _terms.shares = new uint[](_terms.payees.length);
            for (uint i = 0; i < _terms.payees.length; i++) {
                _terms.shares[i] = ownership.shareOf(_terms.payees[i]);
            }
        }

        RentalAgreement agreement = new RentalAgreement(cns, _tenant, _terms);
        return address(agreement);
    }
    
}