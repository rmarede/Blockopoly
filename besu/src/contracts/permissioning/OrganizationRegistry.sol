// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Strings.sol";
import "../utils/Context.sol";
import "../interface/permissioning/IOrganizationRegistry.sol";

contract OrganizationRegistry is IOrganizationRegistry, Context {

    bool private networkBoot = false;

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    modifier onlyOrgVoter() {
        require(msg.sender == organizationVoterAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    struct OrganizationDetails {
        string orgId;
        bool active;
        // uint maxNodeNumber;
    }

    OrganizationDetails[] private orgList;
    mapping(string => uint) private indexOf;

    constructor(address _cns) Context(_cns) {
        orgList.push();
    }

    function addOrg(string calldata _orgId) public override onlyMain {
        require(!orgExists(_orgId));
        OrganizationDetails memory org = OrganizationDetails(_orgId, true);
        orgList.push(org);
        indexOf[_orgId] = orgList.length - 1;        
    }

    function orgExists(string calldata _orgId) public view override returns (bool) {
        return indexOf[_orgId] != 0;
    }

    function isActive(string calldata _orgId) public view override returns (bool) {
        return orgList[indexOf[_orgId]].active;
    }

    function deactivateOrg(string calldata _orgId) public override onlyOrgVoter {
        require(orgExists(_orgId));
        uint index = indexOf[_orgId];
        orgList[index].active = false;
    }

    function reactivateOrg(string calldata _orgId) public override onlyOrgVoter {
        require(orgExists(_orgId));
        uint index = indexOf[_orgId];
        orgList[index].active = true;
    }


}