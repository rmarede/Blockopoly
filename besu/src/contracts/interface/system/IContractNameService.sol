// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct ContractInstance {
        string name;
        address addr;
        uint version;
    }

interface IContractNameService {
    //event ...
    function getContractAddress(string calldata _name) external view returns (address);
    function getContractVersion(string calldata _name) external view returns (uint);
    function setContractAddress(string memory _name, address _address) external;
    function isRegistered(address _address) external view returns (string memory);
    function getContractHistory() external view returns (ContractInstance[] memory);
}