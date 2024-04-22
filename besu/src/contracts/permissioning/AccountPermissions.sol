// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../system/ContractNameService.sol";
import "./AccountRegistry.sol";
import "./RoleRegistry.sol";
import "./OrganizationRegistry.sol";

// Account Permissions Interface Contract
contract AccountPermissions {

    address private CNS_ADDRESS = address(0);
    
    function transactionAllowed(address _sender, address _target, uint256 _value, uint256 _gasPrice, uint256 _gasLimit, bytes calldata _payload) 
    external view returns (bool) {

        if(CNS_ADDRESS == address(0)) {
            return true;
        }

        OrganizationRegistry organizationRegistry = OrganizationRegistry(ContractNameService(CNS_ADDRESS).getContractAddress("OrganizationRegistry"));
        RoleRegistry roleRegistry = RoleRegistry(ContractNameService(CNS_ADDRESS).getContractAddress("RoleRegistry"));
        AccountRegistry accountRegistry = AccountRegistry(ContractNameService(CNS_ADDRESS).getContractAddress("AccountRegistry"));

        if (accountRegistry.isActive(_sender) && organizationRegistry.isActive(accountRegistry.orgOf(_sender))) {
            if (_target == address(0)) { // smart contract creation
                return roleRegistry.canCreateContracts(accountRegistry.roleOf(_sender));
            }
            return true;
        } 
        
        return false;
    }


    function boot(address _cns) public {
        require(_cns != address(0), "AccountPermissions: specified address is zero");
        require(CNS_ADDRESS == address(0), "AccountPermissions: already booted");
        CNS_ADDRESS = _cns;
    }
}
