pragma solidity ^0.8.0;

// Account Permissions Interface Contract
contract AccountPermissions {

    address private ACCOUNT_RULES_ADDRESS = address(0);
    
    function transactionAllowed(address _sender, address _target, uint256 _value, uint256 _gasPrice, uint256 _gasLimit, bytes calldata _payload) 
    external view returns (bool) {

        if(ACCOUNT_RULES_ADDRESS == address(0)) {
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

    function boot(address _rulesAddress) public {
        require(_rulesAddress != address(0), "AccountPermissions: specified address is zero");
        require(ACCOUNT_RULES_ADDRESS == address(0), "AccountPermissions: already booted");
        ACCOUNT_RULES_ADDRESS = _rulesAddress;
    }
}
