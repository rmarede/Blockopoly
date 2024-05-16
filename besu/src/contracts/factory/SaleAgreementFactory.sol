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
    
    function createSaleAgreement(address _buyer, address _seller, address _realty, uint _share, uint _price, uint _earnest,
    uint _comission, uint _contengencyPeriod, bytes memory _contengencyClauses) public returns (address) {
        require(IRoleRegistry(roleRegistryAddress()).canMintSaleAgreements(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "SaleAgreementFactory: only realtor can create sale agreement contracts");
        SaleAgreement.SaleDetails memory details = SaleAgreement.SaleDetails(_buyer, _seller, _realty, _share, _price, _earnest, msg.sender, _comission, _contengencyPeriod, _contengencyClauses);
        SaleAgreement agreement = new SaleAgreement(cns_address, details);
        salesOf[_realty].push(address(agreement));
        salesOf[_buyer].push(address(agreement)); // TODO deixar estes dois?
        salesOf[_seller].push(address(agreement));
        emit NewSaleAgreement(_buyer, _seller, _realty, address(agreement));
        return address(agreement);
    }

    function createSaleAgreement(SaleAgreement.SaleDetails memory _details) public returns (address) {
        require(IRoleRegistry(roleRegistryAddress()).canMintSaleAgreements(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "SaleAgreementFactory: only realtor can create sale agreement contracts");
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