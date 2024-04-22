// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../system/ContractNameService.sol";
import "./AccountRegistry.sol";
import "./NodeRegistry.sol";
import "./RolesRegistry.sol";

// Account Permissions Interface Contract
contract AccountPermissions {

    address private CNS_ADDRESS = address(0);
    
    function transactionAllowed(address _sender, address _target, uint256 _value, uint256 _gasPrice, uint256 _gasLimit, bytes calldata _payload) 
    external view returns (bool) {

        if(CNS_ADDRESS == address(0)) {
            return true;
        }
        
        if (accountPermitted(_sender)) {
            if (_target == address(0)) { // contract creation
                return getCanCreateContracts(_sender);
        }
            return true;
        } else {
            return false;
        }
    }

    function accountPermitted(address _account) public view returns (bool) {
        return true;
    }

    function getCanCreateContracts(address _account) public view returns (bool) {
        return true;
    }

    function boot(address _cns) public {
        require(_cns != address(0), "AccountPermissions: specified address is zero");
        require(CNS_ADDRESS == address(0), "AccountPermissions: already booted");
        CNS_ADDRESS = _cns;
    }
}
