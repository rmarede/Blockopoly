// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../governance/OrganizationMultiSig.sol";

contract Organizations is OrganizationMultiSig{

    bool private networkBoot = false;

    modifier onlySelf() {
        require(msg.sender == address(this), "Organizations: Permission denied");
        _;
    }

    modifier orgDoesNotExist(string memory _orgId) {
        require(checkOrgExists(_orgId) == false, "org exists");
        _;
    }

    struct OrgDetails {
        string orgId;
        string parentId;
        string fullOrgId;
        string ultParent;
        uint pindex;
        uint level;
        uint [] subOrgIndexList;
    }

    constructor(bytes32[] memory _organizations) OrganizationMultiSig(_organizations, Policy.MAJORITY) {
    }

    

    mapping(bytes32 => OrgDetails) private organizations;
    uint private orgNum = 0;

    function addOrg(string calldata _orgId) public onlySelf orgDoesNotExist(_orgId) {
        
    }

    function checkOrgExists(string memory _orgId) public view returns (bool) {
        return  false; //(!(organizations[_orgId].orgId == _orgId));
    }




}