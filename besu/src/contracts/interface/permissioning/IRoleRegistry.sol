// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum Permission {
        CAN_CREATE_ACCOUNTS,
        CAN_CREATE_ROLES,
        CAN_CREATE_NODES,
        CAN_CREATE_CONTRACTS,
        CAN_MINT_CURRENCY,
        CAN_MINT_REALTIES,
        CAN_MINT_SALEAGREEMENTS,
        CAN_MINT_LOANS
}

interface IRoleRegistry {
    function addRole(string memory _roleName, string memory _orgId, uint _privilege, Permission[] memory _perms) external;
    function roleExists(string memory _roleName) external view returns (bool);
    function privilegeOf(string memory _roleName) external view returns (uint);
    function canCreateAccounts(string memory _roleName) external view returns (bool);
    function canCreateRoles(string memory _roleName) external view returns (bool);
    function canCreateNodes(string memory _roleName) external view returns (bool);
    function canCreateContracts(string memory _roleName) external view returns (bool);
    function canMintCurrency(string memory _roleName) external view returns (bool);
    function canMintRealties(string memory _roleName) external view returns (bool);
    function canMintSaleAgreements(string memory _roleName) external view returns (bool);
    function canMintLoans(string memory _roleName) external view returns (bool);
    function hasPermission(string memory _roleName, Permission _perm) external view returns (bool);
    //function canTarget(string memory _senderRole, string memory _targetRole) external view returns (bool);
}