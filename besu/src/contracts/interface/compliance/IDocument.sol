// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDocument {
    // Document Management
    function name() external pure returns (string memory);
    function issuer() external pure returns (string memory);
    function expirationDate(address _asset) external view returns (uint);
    // Document Events
    event DocumentRemoved(string indexed _name, string _uri, bytes32 _documentHash);
}