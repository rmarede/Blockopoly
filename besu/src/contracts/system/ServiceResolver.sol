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

    ContractInstance[] internal registry;
    mapping(string => uint256) internal indexOf;

    constructor() {
        registry.push(ContractInstance({
            name: "ServiceResolver",
            addr: address(this),
            version: 1
        }));
    }

    function setContractAddress(string calldata _name, address _addr) public virtual {
        require(bytes(_name).length != 0, "Contract name must not be empty.");
        require(_addr != address(0), "Contract address must not be zero.");
        require(isAuthorized(msg.sender), "Not authorized to update contract registry.");
        ContractInstance memory instance;

        if (indexOf[_name] > 0) {
            uint256 index = indexOf[_name];
            ContractInstance memory old = registry[index];
            instance = ContractInstance({
                name: _name,
                addr: _addr,
                version: old.version + 1
            });
        } else {
            instance = ContractInstance({
                name: _name,
                addr: _addr,
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
