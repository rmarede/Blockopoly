// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockRealtyFactory {

    struct RealtyDetails {
        string name; 
        address ownership;
        string kind;
        string district;
        string location;
        string image;
        uint totalArea;
    }

    address[] public registry;
    mapping(address => RealtyDetails) public realties;
    mapping(address => address[]) public realtiesOf;

    address public mockMint;
    address[] public mockRealtiesOf;
    RealtyDetails public mockDetailsOf;
    string public mockKindOf;

    bool public mockAddOwnership = true;
    bool public mockRemoveOwnership = true;

    constructor(address _cns) {}

    function mint(RealtyDetails memory _details, address[] memory _owners, uint[] memory _shares) public returns (address) {
        return mockMint;
    }

    function getRealtiesOf(address _user) public view returns (address[] memory) {
        return mockRealtiesOf;
    }

    function detailsOf(address _assetId) public view returns (RealtyDetails memory) {
        return mockDetailsOf;
    }

    function kindOf(address _assetId) public view returns (string memory) {
        return mockKindOf;
    }

    function addOwnership(address _assetId, address _user) public {
        require(mockAddOwnership, "RealtyFactory: addOwnership failed");
    }

    function removeOwnership(address _assetId, address _user) public {
        require(mockRemoveOwnership, "RealtyFactory: removeOwnership failed");
    }

    function setMockMint(address _mockMint) public {
        mockMint = _mockMint;
    }

    function setMockRealtiesOf(address[] memory _mockRealtiesOf) public {
        mockRealtiesOf = _mockRealtiesOf;
    }

    function setMockDetailsOf(RealtyDetails memory _mockDetailsOf) public {
        mockDetailsOf = _mockDetailsOf;
    }

    function setMockKindOf(string memory _mockKindOf) public {
        mockKindOf = _mockKindOf;
    }

    function setMockAddOwnership(bool _mockAddOwnership) public {
        mockAddOwnership = _mockAddOwnership;
    }

    function setMockRemoveOwnership(bool _mockRemoveOwnership) public {
        mockRemoveOwnership = _mockRemoveOwnership;
    }

}