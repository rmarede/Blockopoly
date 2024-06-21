// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../SaleAgreement.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract SaleAgreementFactory is Context {

    event NewSaleAgreement(address indexed buyer, address indexed seller, address indexed realty, address agreement);

    mapping (address => address[]) public salesOf;

    constructor(address _cns) Context(_cns) {}
    
    function createSaleAgreement(SaleAgreement.SaleDetails memory _details) public returns (address) {
        // TODO check msg.sender?
        SaleAgreement agreement = new SaleAgreement(cns_address, _details);
        salesOf[_details.realty].push(address(agreement));
        salesOf[_details.buyer].push(address(agreement));
        salesOf[_details.seller].push(address(agreement));
        emit NewSaleAgreement(_details.buyer, _details.seller, _details.realty, address(agreement));
        return address(agreement);
    }

    function getSalesOf(address _account) public view returns (address[] memory) {
        return salesOf[_account];
    }
    
}