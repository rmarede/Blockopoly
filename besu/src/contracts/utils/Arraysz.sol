// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Arraysz {
    
    function arrayContains(uint[] memory array, uint target) public pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }

    function arrayContains(address[] memory array, address target) public pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }

   function remove(uint[] memory array, uint target) public pure returns (uint[] memory) {
        uint[] memory result = new uint[](array.length - 1);
        uint j = 0;
        for (uint i = 0; i < array.length; i++) {
            if (array[i] != target) {
                result[j] = array[i];
                j++;
            }
        }
        return result;
    }

    function remove(address[] memory array, address target) public pure returns (address[] memory) {
        address[] memory result = new address[](array.length - 1);
        uint j = 0;
        for (uint i = 0; i < array.length; i++) {
            if (array[i] != target) {
                result[j] = array[i];
                j++;
            }
        }
        return result;
    }

    function mergeBytes(bytes memory a, bytes memory b) public pure returns (bytes memory) {
        bytes memory result = new bytes(a.length + b.length);
        for (uint i = 0; i < a.length; i++) {
            result[i] = a[i];
        }
        for (uint i = 0; i < b.length; i++) {
            result[i + a.length] = b[i];
        }
        return result;
    }
}

