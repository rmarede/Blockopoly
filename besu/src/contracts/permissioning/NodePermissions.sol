pragma solidity ^0.8.0;

// Node Permissions Interface Contract
contract NodePermissions {

    address private NODE_RULES_ADDRESS = address(0);

    function connectionAllowed(string calldata _enodeId, string calldata _ip, uint16 _port) external view returns (bool) {

        if(NODE_RULES_ADDRESS == address(0)) {
            return true;
        }

        return true;
    }

    function boot(address _rulesAddress) public {
        require(_rulesAddress != address(0), "NodePermissions: specified address is zero");
        require(NODE_RULES_ADDRESS == address(0), "NodePermissions: already booted");
        NODE_RULES_ADDRESS = _rulesAddress;
    }
    
}