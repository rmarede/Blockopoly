// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../governance/OrganizationMultiSig.sol";
import "../utils/Strings.sol";
import "../utils/Context.sol";

contract OrganizationRegistry is OrganizationMultiSig, Context {

    bool private networkBoot = false;

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    modifier orgDoesNotExist(string memory _orgId) {
        require(indexOf[_orgId] == 0, "OrganizationRegistry: Organization already exists");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "OrganizationRegistry: Permission denied");
        _;
    }

    modifier orgExists(string memory _orgId) {
        require(indexOf[_orgId] != 0, "OrganizationRegistry: Organization does not exist");
        _;
    }

    struct OrganizationDetails {
        string orgId;
        bool active;
    }

    OrganizationDetails[] private orgList;
    mapping(string => uint) private indexOf;

    constructor(address _cns, string[] memory _organizations) OrganizationMultiSig(_organizations, Policy.MAJORITY) Context(_cns) {
        for (uint i = 0; i < _organizations.length; i++) {
            require(!Strings.equals(_organizations[i], ""));
            require(indexOf[_organizations[i]] == 0, "OrganizationRegistry: Organization duplicated");
            OrganizationDetails memory org = OrganizationDetails(_organizations[i], true);
            orgList.push(org);
            indexOf[_organizations[i]] = orgList.length - 1; 
        }
    }

    function addOrg(string calldata _orgId) public onlyMain orgDoesNotExist(_orgId) {
        OrganizationDetails memory org = OrganizationDetails(_orgId, true);
        orgList.push(org);
        indexOf[_orgId] = orgList.length - 1;        
    }

    function deactivateOrg(string calldata _orgId) public onlySelf orgExists(_orgId) {
        uint index = indexOf[_orgId];
        orgList[index].active = false;
    }

    function reactivateOrg(string calldata _orgId) public onlySelf orgExists(_orgId) {
        uint index = indexOf[_orgId];
        orgList[index].active = true;
    }


}