// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../SaleAgreement.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract SaleAgreementFactory is Context {

    constructor(address _cns) Context(_cns) {}
    
    function createSaleAgreement(address _realty, address _buyer, address _seller, uint _price, uint _share, uint _comission) public returns (address) {
        require(IRoleRegistry(roleRegistryAddress()).canMintSaleAgreements(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "SaleAgreementFactory: only realtor can create sale agreement contracts");

        SaleAgreement agreement = new SaleAgreement(cns_address, _realty, _buyer, _seller, _price, _share, msg.sender, _comission);
        return address(agreement);
    }
    
}