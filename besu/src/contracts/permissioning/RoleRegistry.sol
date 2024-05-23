// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/permissioning/IRoleRegistry.sol";
import "../utils/Context.sol";

contract RoleRegistry is IRoleRegistry, Context {

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    struct Role {
        string name;
        string orgId;
        uint privilege;
    }

    Role[] private roleList;
    mapping(string => uint) private indexOf;
    mapping(string => mapping(Permission => bool)) rolePermission;

    constructor(address _cns) Context(_cns) {
        roleList.push(); // TODO verificar se isto da mm push e aumenta o tamanho do array
    }

    function addRole(string memory _roleName, string memory _orgId, uint _privilege, Permission[] memory _perms) public override onlyMain {
        require(bytes(_roleName).length > 0, "RoleRegistry: Role name cannot be empty");
        string memory roleName = string(abi.encodePacked(_orgId, "_", _roleName));
        require(!roleExists(roleName), "RoleRegistry: Role already exists");
        Role memory role = Role(roleName, _orgId, _privilege);
        roleList.push(role);
        indexOf[roleName] = roleList.length - 1;
        for (uint i = 0; i < _perms.length; i++) {
            rolePermission[roleName][_perms[i]] = true;
        }
        emit RoleAdded(roleName, _orgId, _privilege, _perms);
    }

    function getRoles() public view returns (Role[] memory) {
        return roleList;
    }

    function roleExists(string memory _roleName) public view override returns (bool) {
        return indexOf[_roleName] != 0;
    }

    function privilegeOf(string memory _roleName) public view override returns (uint) {
        require(roleExists(_roleName), "RoleRegistry: Role does not exist");
        return roleList[indexOf[_roleName]].privilege;
    }

    function orgOf(string memory _roleName) public view returns (string memory) {
        require(roleExists(_roleName), "RoleRegistry: Role does not exist");
        return roleList[indexOf[_roleName]].orgId;
    }

    function canCreateAccounts(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_ACCOUNTS);
    }

    function canCreateRoles(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_ROLES);  
    }

    function canCreateNodes(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_NODES);  
    }

    function canCreateContracts(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_CREATE_CONTRACTS);
    }

    function canMintCurrency(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_MINT_CURRENCY);
    }

    function canMintRealties(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_MINT_REALTIES);
    }

    function canMintSaleAgreements(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_MINT_SALEAGREEMENTS);
    }

    function canMintLoans(string memory _roleName) public view override returns (bool) {
        return hasPermission(_roleName, Permission.CAN_MINT_LOANS);
    }

    function hasPermission(string memory _roleName, Permission _perm) public view override returns (bool) {
        require(roleExists(_roleName), "RoleRegistry: Role does not exist");
        return rolePermission[_roleName][_perm];
    }

}