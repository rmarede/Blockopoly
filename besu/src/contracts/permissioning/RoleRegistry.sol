// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Strings.sol";
import "../utils/Context.sol";

contract RoleRegistry is Context {

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    struct Role {
        string name;
        string orgId;
        bool isAdmin;
        uint privilege;
    }

    enum Permission {
        CAN_CREATE_ACCOUNTS,
        CAN_CREATE_ROLES,
        CAN_CREATE_NODES,
        CAN_CREATE_CONTRACTS
    }

    Role[] private roleList;
    mapping(string => uint) private indexOf;
    mapping(string => mapping(Permission => bool)) rolePermission;

    constructor(address _cns, string[] memory _orgs) Context(_cns) {
        roleList.push(); // TODO verificar se isto da mm push e aumenta o tamanho do array
        for (uint i = 0; i < _orgs.length; i++) {
            addRole(string(abi.encodePacked("admin_", _orgs[i])), _orgs[i], true, 1, new Permission[](0));
        }
    }

    function addRole(string memory _roleName, string memory _orgId, bool _isAdmin, uint _privilege, Permission[] memory _perms) public onlyMain {
        require(!Strings.equals(_roleName, "RoleRegistry: Role name cannot be empty"));
        require(!roleExists(_roleName), "RoleRegistry: Role already exists");
        Role memory role = Role(_roleName, _orgId, _isAdmin, _privilege);
        roleList.push(role);
        indexOf[_roleName] = roleList.length - 1;
        for (uint i = 0; i < _perms.length; i++) {
            rolePermission[_roleName][_perms[i]] = true;
        }
    }

    function roleExists(string memory _roleName) public view returns (bool) {
        return indexOf[_roleName] != 0;
    }

    function isAdmin(string memory _roleName) public view returns (bool) {
        require(roleExists(_roleName));
        return roleList[indexOf[_roleName]].isAdmin;
    }

    function privilegeOf(string memory _roleName) public view returns (uint) {
        require(roleExists(_roleName));
        return roleList[indexOf[_roleName]].privilege;
    }

    function canCreateAccounts(string memory _roleName) public view returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_ACCOUNTS) || isAdmin(_roleName);
    }

    function canCreateRoles(string memory _roleName) public view returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_ROLES) || isAdmin(_roleName);  
    }

    function canCreateNodes(string memory _roleName) public view returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_NODES) || isAdmin(_roleName);  
    }

    function canCreateContracts(string memory _roleName) public view returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_CONTRACTS);
    }

    function hasPermission(string memory _roleName, Permission _perm) public view returns (bool) {
        require(roleExists(_roleName));
        return rolePermission[_roleName][_perm];
    }

}