// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../system/ContractNameService.sol";
import "./NodeRegistry.sol";
import "./OrganizationRegistry.sol";

// Node Permissions Interface Contract
contract NodePermissions {

    address private CNS_ADDRESS = address(0);

    function connectionAllowed(string calldata _enodeId, string calldata _ip, uint16 _port) external view returns (bool) {

        if(CNS_ADDRESS == address(0)) {
            return true;
        }

        OrganizationRegistry organizationRegistry = OrganizationRegistry(ContractNameService(CNS_ADDRESS).getContractAddress("OrganizationRegistry"));
        NodeRegistry nodeRegistry = NodeRegistry(ContractNameService(CNS_ADDRESS).getContractAddress("NodeRegistry"));

        bool nodeOK = nodeRegistry.isActive(_enodeId);
        bool orgOK = organizationRegistry.isActive(nodeRegistry.orgOf(_enodeId));
        // TODO check ip and port, referir que solucao so deixa nodes especificados se juntarem pelos ips e ports especificados, por razoes de seguranca

        return nodeOK && orgOK;
    }

    function boot(address _cns) public {
        require(_cns != address(0), "NodePermissions: specified address is zero");
        require(CNS_ADDRESS == address(0), "NodePermissions: already booted");
        CNS_ADDRESS = _cns;
    }
    
}