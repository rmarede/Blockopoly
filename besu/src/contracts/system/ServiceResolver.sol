pragma solidity ^0.8.0;

// alt names: ServiceResolver, ContractResolverService
// REGISTRY DESIGN PATTERN
// alt: ERC-1820
contract ServiceResolver {

    struct ContractInstance {
        string name;
        address addr;
        uint256 version;
    }

    mapping(string => uint256) internal indexOf;
    ContractInstance[] internal registry;

    constructor(string[] memory _names, address[] memory _addresses) {
        require(_names.length == _addresses.length, "ContractDNS: names and addresses length mismatch");
        for (uint256 i = 0; i < _names.length; i++) {
            registry.push(ContractInstance({
                name: _names[i],
                addr: _addresses[i],
                version: 1
            }));

            indexOf[_names[i]] = i;
        }
    }

    function setContractAddress(string memory _name, address _addr) public virtual {
        require(isAuthorized(msg.sender), "Not authorized to update contract registry.");
        uint256 index = indexOf[_name];
        ContractInstance memory old = registry[index];
        registry.push(ContractInstance({
            name: _name,
            addr: _addr,
            version: old.version + 1
        }));
        indexOf[_name] = registry.length - 1;
    }

    function getContractVersion(string memory _name) public view virtual returns (uint256) {
        return registry[indexOf[_name]].version;
    }

    function getContractAddress(string memory _name) public view virtual returns (address) {
        return registry[indexOf[_name]].addr;
    }

    function getContractHistory() public view virtual returns (ContractInstance[] memory) {
        return registry;
    }

    function isAuthorized(address _account) public view returns(bool) {
        return true;
    }

}
