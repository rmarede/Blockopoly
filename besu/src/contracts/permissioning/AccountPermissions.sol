pragma solidity ^0.8.0;

contract AccountPermissions {
    
    function transactionAllowed(address _sender, address _target, uint256 _value, uint256 _gasPrice, uint256 _gasLimit, bytes calldata _payload) 
    external view returns (bool) {
        
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
}
