// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/compliance/IDocument.sol";
import "../utils/Context.sol";
import "../interface/permissioning/IAccountRegistry.sol";


contract ADocument is IDocument, Context {

    modifier onlyIssuer() {
        address accountRegistry = accountRegistryAddress();
        if (accountRegistry != address(0)) {
            require(keccak256(abi.encodePacked(IAccountRegistry(accountRegistry).orgOf(msg.sender))) == keccak256(abi.encodePacked(issuer_org)), "ADocument: sender does not have permission to issue this kind of document");
        }
        require(msg.sender == msg.sender, "ADocument: Only the emitter can perform this action");
        _;
    }

    struct Doc {
        address asset;
        uint expirationDate;
        uint val1;
        uint val2;
    }

    string public constant issuer_org = "bank";

    mapping (address => Doc) public docs;

    constructor(address _cns) Context(_cns) {}

    function name() public pure override returns (string memory) {
        return "ADocument";
    }

    function issuer() public pure override returns (string memory) {
        return issuer_org;
    }

    function expirationDate(address _asset) public view override returns (uint) {
        return docs[_asset].expirationDate;
    }

    function issueDocument(address _asset, uint _val1, uint _val2) public onlyIssuer {
        docs[_asset] = Doc(_asset, block.timestamp + 365 days, _val1, _val2);
    }

    function last(address _asset) public view returns (uint, uint) {
        return (docs[_asset].val1, docs[_asset].val2);
    }


}