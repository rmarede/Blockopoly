// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/system/IContractNameService.sol";

// REGISTRY DESIGN PATTERN
// alt: ERC-1820
contract ContractNameService is IContractNameService {

    event ContractAddressSet(string indexed name, address addr, uint version);

    ContractInstance[] internal registry;
    mapping(string => uint) internal indexOf;

    constructor(string[] memory _names, address[] memory _addresses) {
        require(_names.length == _addresses.length, "ContractNameService: Names and addresses must be of equal length.");

        registry.push(ContractInstance({
            name: "ContractNameService",
            addr: address(this),
            version: 0
        }));

        for (uint i = 0; i < _names.length; i++) {
            setContractAddress(_names[i], _addresses[i]);
        }
    }

    function setContractAddress(string memory _name, address _address) public override {
        require(bytes(_name).length != 0, "ContractNameService: Contract name must not be empty.");
        require(_address != address(0), "ContractNameService: Contract address must not be zero.");
        require(isAuthorized(msg.sender), "ContractNameService: Not authorized to update contract registry.");
        ContractInstance memory instance;

        if (indexOf[_name] > 0) {
            uint index = indexOf[_name];
            ContractInstance memory old = registry[index];
            instance = ContractInstance({
                name: _name,
                addr: _address,
                version: old.version + 1
            });
        } else {
            instance = ContractInstance({
                name: _name,
                addr: _address,
                version: 1
            });
        }

        registry.push(instance);
        indexOf[_name] = registry.length - 1;
        emit ContractAddressSet(_name, _address, instance.version);
    }

    function getContractVersion(string calldata _name) public view override returns (uint) {
        require(indexOf[_name] > 0, "ContractNameService: Contract not found in registry.");
        return registry[indexOf[_name]].version;
    }

    function getContractAddress(string calldata _name) public view override returns (address) {
        if (indexOf[_name] == 0) {
            return address(0);
        }
        return registry[indexOf[_name]].addr;
    }

    function isRegistered(address _address) public view override returns (bool) {
        for (uint i = 0; i < registry.length; i++) {
            if (registry[i].addr == _address) {
                return true;
            }
        }
        return false;
    }

    function isRegistered(string memory _service) public view override returns (bool) {
        return indexOf[_service] > 0;
    }

    function getContractHistory() public view override returns (ContractInstance[] memory) {
        return registry;
    }

    function isAuthorized(address _account) public pure returns(bool) {
        return true;
    }

}
