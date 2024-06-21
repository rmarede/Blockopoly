// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../interface/compliance/IDocument.sol";
import "../factory/RealtyFactory.sol";
import "../interface/permissioning/IRoleRegistry.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract Compliance is Context {

    constructor(address _cns) Context(_cns) {}

    mapping (string => mapping(string => address[])) public compliance;

    modifier onlyAuthorized() {
        address roleRegistry = roleRegistryAddress();
        if (roleRegistry != address(0)) {
            require(IRoleRegistry(roleRegistry).canDefinePolicies(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "Compliance: sender does not have permission to define policies");
        }
        _;
    }

    function documentation(string memory _realtyKind, string memory _service) public view returns (address[] memory) {
        return compliance[_service][_realtyKind];
    }

    function addDocumentation(string memory _realtyKind, string memory _service, address _document) public onlyAuthorized {
        compliance[_service][_realtyKind].push(_document);
    }

    function removeDocumentation(string memory _realtyKind, string memory _service, address _document) public onlyAuthorized {
        address[] storage docs = compliance[_service][_realtyKind];
        for (uint i = 0; i < docs.length; i++) {
            if (docs[i] == _document) {
                docs[i] = docs[docs.length - 1];
                docs.pop();
                break;
            }
        }
    }

    function isCompliant(address _realty, string memory _service) public view returns (bool) {
        RealtyFactory realtyFactory = RealtyFactory(realtyFactoryContractAddress());
        string memory kind = realtyFactory.kindOf(_realty);
        address[] storage docs = compliance[_service][kind];
        for (uint i = 0; i < docs.length; i++) {
            if (IDocument(docs[i]).expirationDate(_realty) < block.timestamp) {
                return false;
            }
        }
        return true;
    }
}