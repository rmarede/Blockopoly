// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../SaleAgreement.sol";

contract SaleAgreementFactory {

    address private cns;

    constructor(address _cns) {
        cns = _cns;
    }
    
    function createSaleAgreement(address _realty, address _buyer, address _seller, uint _price, uint _share, uint _comission) public returns (address) {
        require(msg.sender == msg.sender, "SaleAgreementFactory: only realtor can create sale agreement contracts"); // TODO quando tiver orgs
        SaleAgreement agreement = new SaleAgreement(cns, _realty, _buyer, _seller, _price, _share, msg.sender, _comission);
        return address(agreement);
    }
    
}