// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/system/IContractNameService.sol";

contract Context { 

    IContractNameService internal cns;
    address internal cns_address;
    
    constructor(address _cns) {
        require(_cns != address(0), "Invalid CNS address");
        cns = IContractNameService(_cns);
        cns_address = _cns;
    }

    function setCns(address _cns) internal {
        require(_cns != address(0), "Already set");
        cns = IContractNameService(_cns);
    }

    function realtyFactoryContractAddress() internal view returns (address) {
        return cns.getContractAddress("RealtyFactory");
    }

    function walletContractAddress() internal view returns (address) {
        return cns.getContractAddress("Wallet");
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

    function roleRegistryAddress() internal view returns (address) {
        return cns.getContractAddress("RoleRegistry");
    }

    function organizationVoterAddress() internal view returns (address) {
        return cns.getContractAddress("OrganizationVoter");
    }

    function complianceAddress() internal view returns (address) {
        return cns.getContractAddress("Compliance");
    }

}