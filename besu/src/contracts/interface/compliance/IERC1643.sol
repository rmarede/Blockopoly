// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC1643 {
    // Document Management
    function getDocument(string memory _name) external view returns (string memory, bytes32, uint256);
    function setDocument(string memory _name, string memory _uri, bytes32 _documentHash) external;
    function removeDocument(string memory _name) external;
    function getAllDocuments() external view returns (string[] memory);
    // Document Events
    event DocumentRemoved(string indexed _name, string _uri, bytes32 _documentHash);
    event DocumentUpdated(string indexed _name, string _uri, bytes32 _documentHash);
}