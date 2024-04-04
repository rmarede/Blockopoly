// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// REGISTRY DESIGN PATTERN
// alt: ERC-1820
contract ContractNameService {

    struct ContractInstance {
        string name;
        address addr;
        uint256 version;
    }

    ContractInstance[] internal registry;
    mapping(string => uint256) internal indexOf;

    constructor(string[] memory _names, address[] memory _addresses) {
        require(_names.length == _addresses.length, "Names and addresses must be of equal length.");

        registry.push(ContractInstance({
            name: "ContractNameService",
            addr: address(this),
            version: 0
        }));

        for (uint256 i = 0; i < _names.length; i++) {
            setContractAddress(_names[i], _addresses[i]);
        }
    }

    function setContractAddress(string memory _name, address _address) public virtual {
        require(bytes(_name).length != 0, "Contract name must not be empty.");
        require(_address != address(0), "Contract address must not be zero.");
        require(isAuthorized(msg.sender), "Not authorized to update contract registry.");
        ContractInstance memory instance;

        if (indexOf[_name] > 0) {
            uint256 index = indexOf[_name];
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
    }

    function getContractVersion(string calldata _name) public view virtual returns (uint256) {
        require(indexOf[_name] > 0, "Contract not found in registry.");
        return registry[indexOf[_name]].version;
    }

    function getContractAddress(string calldata _name) public view virtual returns (address) {
        require(indexOf[_name] > 0, "Contract not found in registry.");
        return registry[indexOf[_name]].addr;
    }

    function getContractHistory() public view virtual returns (ContractInstance[] memory) {
        return registry;
    }

    function isAuthorized(address _account) public view returns(bool) {
        return true;
    }

}
