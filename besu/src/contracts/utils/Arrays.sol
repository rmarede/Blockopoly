pragma solidity ^0.8.0;

library Arrays {
    
    function arrayContains(uint256[] memory array, uint256 target) public pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }

}

