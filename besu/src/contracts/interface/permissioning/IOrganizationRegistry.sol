// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOrganizationRegistry {
    event OrganizationAdded(string indexed orgId);
    event OrganizationDeactivated(string indexed orgId);
    event OrganizationReactivated(string indexed orgId);
    function addOrg(string calldata _orgId) external;
    function orgExists(string calldata _orgId) external view returns (bool);
    function isActive(string calldata _orgId) external view returns (bool);
    function deactivateOrg(string calldata _orgId) external;
    function reactivateOrg(string calldata _orgId) external;
}