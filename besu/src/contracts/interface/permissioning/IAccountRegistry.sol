// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct AccountDetails {
        address account;
        string orgId;
        string role;
        bool isAdmin;
        bool active;
}

interface IAccountRegistry {
    event AccountAdded(address indexed account, string indexed orgId, string role, bool isAdmin);
    event AccountRoleChanged(address indexed account, string role);
    event AccountDeactivated(address indexed account);
    event AccountActivated(address indexed account);
    function addAccount(address _account, string memory _orgId, string memory _role, bool _isAdmin) external;
    function changeRoleOf(address _account, string memory _role) external;
    function roleOf(address _account) external view returns (string memory);
    function orgOf(address _account) external view returns (string memory);
    function accountExists(address _account) external view returns (bool);
    function isAdmin(address _account) external view returns (bool);
    function isActive(address _account) external view returns (bool);
    function deactivateAccount(address _account) external;
    function activateAccount(address _account) external;
}