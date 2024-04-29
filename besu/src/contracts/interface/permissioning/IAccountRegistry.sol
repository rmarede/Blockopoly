// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAccountRegistry {
    function addAccount(address _account, string memory _orgId, string memory _role) external;
    function changeRoleOf(address _account, string memory _role) external;
    function roleOf(address _account) external view returns (string memory);
    function orgOf(address _account) external view returns (string memory);
    function accountExists(address _account) external view returns (bool);
    function isActive(address _account) external view returns (bool);
    function deactivateAccount(address _account) external;
    function activateAccount(address _account) external;
}