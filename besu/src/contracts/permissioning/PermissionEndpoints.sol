// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../utils/Strings.sol";
import "./OrganizationRegistry.sol";
import "./RolesRegistry.sol";
import "./AccountRegistry.sol";
import "./NodeRegistry.sol";

contract PermissionEndpoints is Context {

    modifier needsOrganizationConsensus() {
        require(msg.sender == organizationRegistryAddress(), "PermissionEndpoints: Permission denied");
        _;
    }

    constructor(address _cns) Context(_cns) {}

    // TODO talvez ter isto aqui e no AccountPermissions e NodePermissions apenas chamar este contrato
    function accountPermitted(address _account) public view returns (bool) {
        return true;
    }

    function getCanCreateContracts(address _account) public view returns (bool) {
        return false;
    }

    // -------------------------------- ORGANIZATION REGISTRY OPERATIONS --------------------------------

    function addOrganization(string calldata _orgId, address _admin, RolesRegistry.Permission[] memory _perms) public needsOrganizationConsensus {
        OrganizationRegistry(organizationRegistryAddress()).addOrg(_orgId);
        string memory adminRole = string(abi.encodePacked("admin_", _orgId));
        RolesRegistry(rolesRegistryAddress()).addRole(adminRole, _orgId, true, 1, _perms);
        AccountRegistry(accountRegistryAddress()).addAccount(_admin, _orgId, adminRole);
    }

    // ----------------------------------- ROLES REGISTRY OPERATIONS -----------------------------------


    function addRole(string calldata _roleName, string memory _orgId, bool _isAdmin, uint _previlege, RolesRegistry.Permission[] memory _perms) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, _orgId), "AccountRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to create roles");
        require(_previlege > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Role previlege must be greater than sender's role previlege");

        rolesRegistry.addRole(_roleName, _orgId, _isAdmin, _previlege, _perms);
    }


    // ---------------------------------- ACCOUNT REGISTRY OPERATIONS ----------------------------------

    function addAccount(address _account, string memory _orgId, string memory _role) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, _orgId), "AccountRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to create accounts");
        require(rolesRegistry.previledgeOf(_role) > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Sender cannot create accounts with this role");

        accountRegistry.addAccount(_account, _orgId, _role);
    }

    function changeRoleOf(address _account, string memory _role) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, accountRegistry.orgOf(_account)), "AccountRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to change account roles"); // TODO canCreateAccounts -> canChangeAccounts
        require(rolesRegistry.previledgeOf(accRole) > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Sender cannot change account with greater previledge");
        require(rolesRegistry.previledgeOf(_role) > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Sender cannot change account to a role with greater previledge");

        accountRegistry.changeRoleOf(_account, _role);
    }

    function deactivateAccount(address _account) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, accountRegistry.orgOf(_account)), "AccountRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to deactivate accounts");
        require(rolesRegistry.previledgeOf(accRole) > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Sender cannot deactivate account with greater previledge");

        accountRegistry.deactivateAccount(_account);
    }

    function activateAccount(address _account) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, accountRegistry.orgOf(_account)), "AccountRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to activate accounts");
        require(rolesRegistry.previledgeOf(accRole) > rolesRegistry.previledgeOf(senderRole), "RoleRegistry: Sender cannot activate account with greater previledge");

        accountRegistry.activateAccount(_account);
    }

    // ----------------------------------- NODE REGISTRY OPERATIONS -----------------------------------

    function addNode(string memory _enodeId, string memory _ip, uint16 _port, uint16 _raftPort, string memory _orgId) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, _orgId), "NodeRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to create nodes");

        NodeRegistry(nodeRegistryAddress()).addNode(_enodeId, _ip, _port, _raftPort, _orgId);
    }

    function deactivateNode(string memory _enodeId) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());
        NodeRegistry nodeRegistry = NodeRegistry(nodeRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, nodeRegistry.orgOf(_enodeId)), "NodeRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to deactivate nodes");

        nodeRegistry.deactivateNode(_enodeId);
    }

    function activateNode(string memory _enodeId) public {
        AccountRegistry accountRegistry = AccountRegistry(accountRegistryAddress());
        RolesRegistry rolesRegistry = RolesRegistry(rolesRegistryAddress());
        NodeRegistry nodeRegistry = NodeRegistry(nodeRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, nodeRegistry.orgOf(_enodeId)), "NodeRegistry: Sender does not belong to the organization");
        require(rolesRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to activate nodes");

        nodeRegistry.activateNode(_enodeId);
    }

    
}