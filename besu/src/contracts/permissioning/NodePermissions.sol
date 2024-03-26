pragma solidity ^0.8.0;

contract NodePermissions {

    function connectionAllowed(string calldata _enodeId, string calldata _ip, uint16 _port) external view returns (bool) {

        return true;
    }
    
}