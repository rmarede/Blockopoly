// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../system/ContractNameService.sol";
import "../Realties.sol";
import "../Wallet.sol";

contract Context { 

    ContractNameService internal cns;
    address internal cns_address;
    
    constructor(address _cns) {
        require(_cns != address(0), "Invalid CNS address");
        cns = ContractNameService(_cns);
        cns_address = _cns;
    }

    function setCns(address _cns) internal {
        require(_cns != address(0), "Already set");
        cns = ContractNameService(_cns);
    }

    function realtyContract() internal view returns (Realties) {
        return Realties(cns.getContractAddress("Realties"));
    }

    function walletContract() internal view returns (Wallet) {
        return Wallet(cns.getContractAddress("Wallet"));
    }

    function permissionEndpointsAddress() internal view returns (address) {
        return cns.getContractAddress("PermissionEndpoints");
    }

    function organizationRegistryAddress() internal view returns (address) {
        return cns.getContractAddress("OrganizationRegistry");
    }

    function nodeRegistryAddress() internal view returns (address) {
        return cns.getContractAddress("NodeRegistry");
    }

    function accountRegistryAddress() internal view returns (address) {
        return cns.getContractAddress("AccountRegistry");
    }

    function rolesRegistryAddress() internal view returns (address) {
        return cns.getContractAddress("RolesRegistry");
    }

}