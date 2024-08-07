// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INodeRegistry {
    event NodeAdded(string indexed enodeId, string ip, uint16 port, uint16 raftPort, string indexed orgId);
    event NodeDeactivated(string indexed enodeId);
    event NodeActivated(string indexed enodeId);
    function addNode(string memory _enodeId, string memory _ip, uint16 _port, uint16 _raftPort, string memory _orgId) external;
    function nodeExists(string memory _enodeId) external view returns (bool);
    function orgOf(string memory _enodeId) external view returns (string memory);
    function ipOf(string memory _enodeId) external view returns (string memory);
    function portOf(string memory _enodeId) external view returns (uint16);
    function isActive(string memory _enodeId) external view returns (bool);
    function deactivateNode(string memory _enodeId) external;
    function activateNode(string memory _enodeId) external;
}