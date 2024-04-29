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

    constructor(address _cns, string[] memory _organizations) Context(_cns) {
        for (uint i = 0; i < _organizations.length; i++) {
            require(!Strings.equals(_organizations[i], ""));
            require(indexOf[_organizations[i]] == 0, "OrganizationRegistry: Organization duplicated");
            OrganizationDetails memory org = OrganizationDetails(_organizations[i], true);
            orgList.push(org);
            indexOf[_organizations[i]] = orgList.length - 1; 
        }
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