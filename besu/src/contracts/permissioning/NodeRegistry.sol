// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Strings.sol";
import "../utils/Context.sol";

contract NodeRegistry is Context {

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    struct NodeDetails {
        string enodeId;
        string ip;
        uint16 port;
        uint16 raftPort;
        string orgId;
        bool active;
    }

    NodeDetails[] private nodeList;
    mapping(string => uint) private indexOf;

    constructor(address _cns) Context(_cns) {
        nodeList.push(); // TODO verificar se isto da mm push e aumenta o tamanho do array
    }

    function addNode(string memory _enodeId, string memory _ip, uint16 _port, uint16 _raftPort, string memory _orgId) public onlyMain {
        require(!nodeExists(_enodeId), "NodeRegistry: Node already exists");
        NodeDetails memory node = NodeDetails(_enodeId, _ip, _port, _raftPort, _orgId, true);
        nodeList.push(node);
        indexOf[_enodeId] = nodeList.length - 1;
    }

    function nodeExists(string memory _enodeId) public view returns (bool) {
        return indexOf[_enodeId] != 0;
    }

    function orgOf(string memory _enodeId) public view returns (string memory) {
        return nodeList[indexOf[_enodeId]].orgId;
    }

    function ipOf(string memory _enodeId) public view returns (string memory) {
        return nodeList[indexOf[_enodeId]].ip;
    }

    function portOf(string memory _enodeId) public view returns (uint16) {
        return nodeList[indexOf[_enodeId]].port;
    }

    function isActive(string memory _enodeId) public view returns (bool) {
        return nodeList[indexOf[_enodeId]].active;
    }

    function deactivateNode(string memory _enodeId) public onlyMain {
        nodeList[indexOf[_enodeId]].active = false;
    }

    function activateNode(string memory _enodeId) public onlyMain {
        nodeList[indexOf[_enodeId]].active = true;
    }

    //  TODO funcoes para alterar IP e port, onlyMain e verificar autorizacao la


}