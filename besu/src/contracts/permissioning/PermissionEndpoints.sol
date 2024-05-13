// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../utils/Strings.sol";
import "../interface/permissioning/IOrganizationRegistry.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";
import "../interface/permissioning/INodeRegistry.sol";
import "../governance/Multisignable.sol";

contract PermissionEndpoints is Multisignable, Context {

    modifier needsOrganizationConsensus() { // TODO tirar este isRegistered, e ter constructors nos registries
        require(!cns.isRegistered("OrganizationVoter") || msg.sender == organizationVoterAddress(), "PermissionEndpoints: Permission denied");
        _;
    }

    constructor(address _cns) Context(_cns) Multisignable(Policy.MAJORITY) {}

    // TODO talvez ter isto aqui e no AccountPermissions e NodePermissions apenas chamar este contrato
    function accountPermitted(address _account) public view returns (bool) {
        return true;
    }

    function getCanCreateContracts(address _account) public view returns (bool) {
        return false;
    }

    // -------------------------------- ORGANIZATION REGISTRY OPERATIONS --------------------------------

    function addOrganization(string calldata _orgId, address _admin, Permission[] memory _perms) public needsOrganizationConsensus {
        IOrganizationRegistry(organizationRegistryAddress()).addOrg(_orgId);
        IRoleRegistry(roleRegistryAddress()).addRole("admin", _orgId, 0, _perms);
        string memory adminRole = string(abi.encodePacked(_orgId, "_admin"));
        IAccountRegistry(accountRegistryAddress()).addAccount(_admin, _orgId, adminRole, true);
    }

    function deactivateOrganization(string calldata _orgId) public needsOrganizationConsensus {
        IOrganizationRegistry(organizationRegistryAddress()).deactivateOrg(_orgId);
    }

    function reactivateOrganization(string calldata _orgId) public needsOrganizationConsensus {
        IOrganizationRegistry(organizationRegistryAddress()).reactivateOrg(_orgId);
    }

    // ----------------------------------- ROLES REGISTRY OPERATIONS -----------------------------------


    function addRole(string calldata _roleName, uint _privilege, Permission[] memory _perms) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(roleRegistry.canCreateRoles(senderRole), "RoleRegistry: Sender does not have permission to create role");
        require(_privilege > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Role privilege must be greater than sender's role privilege");

        for (uint i = 0; i < _perms.length; i++) {
            require(roleRegistry.hasPermission(senderRole, _perms[i]), "RoleRegistry: Sender cannot grant permission that does not have");
        }

        roleRegistry.addRole(_roleName, senderOrg, _privilege, _perms);
    }


    // ---------------------------------- ACCOUNT REGISTRY OPERATIONS ----------------------------------

    function addAccount(address _account, string memory _role, bool _isAdmin) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(roleRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to create accounts");
        require(Strings.equals(roleRegistry.orgOf(_role), senderOrg), "RoleRegistry: Account role must belong to sender's organization");
        require(roleRegistry.privilegeOf(_role) > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Sender cannot create accounts with this role");

        if(_isAdmin) {
            require(accountRegistry.isAdmin(msg.sender), "AccountRegistry: Sender must be admin to create admin role");
        }

        accountRegistry.addAccount(_account, senderOrg, _role, _isAdmin);
    }

    function changeRoleOf(address _account, string memory _role) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(roleRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to change account role"); // TODO canCreateAccounts -> canChangeAccounts
        require(Strings.equals(roleRegistry.orgOf(accRole), senderOrg), "RoleRegistry: Account role must belong to sender's organization");
        require(Strings.equals(roleRegistry.orgOf(_role), senderOrg), "RoleRegistry: Account role must belong to sender's organization");
        require(roleRegistry.privilegeOf(accRole) > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Sender cannot change account with greater privilege");
        require(roleRegistry.privilegeOf(_role) > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Sender cannot change account to a role with greater privilege");

        accountRegistry.changeRoleOf(_account, _role);
    }

    function deactivateAccount(address _account) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, accountRegistry.orgOf(_account)), "AccountRegistry: Sender does not belong to the organization");
        require(roleRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to deactivate accounts");
        require(roleRegistry.privilegeOf(accRole) > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Sender cannot deactivate account with greater privilege");

        accountRegistry.deactivateAccount(_account);
    }

    function activateAccount(address _account) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory accRole = accountRegistry.roleOf(_account);
        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, accountRegistry.orgOf(_account)), "AccountRegistry: Sender does not belong to the organization");
        require(roleRegistry.canCreateAccounts(senderRole), "RoleRegistry: Sender does not have permission to activate accounts");
        require(roleRegistry.privilegeOf(accRole) > roleRegistry.privilegeOf(senderRole), "RoleRegistry: Sender cannot activate account with greater privilege");

        accountRegistry.activateAccount(_account);
    }

    // ----------------------------------- NODE REGISTRY OPERATIONS -----------------------------------

    function addNode(string memory _enodeId, string memory _ip, uint16 _port, uint16 _raftPort) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(roleRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to create nodes");

        INodeRegistry(nodeRegistryAddress()).addNode(_enodeId, _ip, _port, _raftPort, senderOrg);
    }

    function deactivateNode(string memory _enodeId) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());
        INodeRegistry nodeRegistry = INodeRegistry(nodeRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, nodeRegistry.orgOf(_enodeId)), "NodeRegistry: Sender does not belong to the organization");
        require(roleRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to deactivate nodes");

        nodeRegistry.deactivateNode(_enodeId);
    }

    function activateNode(string memory _enodeId) public {
        IAccountRegistry accountRegistry = IAccountRegistry(accountRegistryAddress());
        IRoleRegistry roleRegistry = IRoleRegistry(roleRegistryAddress());
        INodeRegistry nodeRegistry = INodeRegistry(nodeRegistryAddress());

        string memory senderRole = accountRegistry.roleOf(msg.sender);
        string memory senderOrg = accountRegistry.orgOf(msg.sender);

        require(Strings.equals(senderOrg, nodeRegistry.orgOf(_enodeId)), "NodeRegistry: Sender does not belong to the organization");
        require(roleRegistry.canCreateNodes(senderRole), "RoleRegistry: Sender does not have permission to activate nodes");

        nodeRegistry.activateNode(_enodeId);
    }

    
}

