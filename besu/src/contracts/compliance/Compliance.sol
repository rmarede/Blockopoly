// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";

contract Compliance is Context {

    constructor(address _cns) Context(_cns) {}

    function saleCompliance(address _realty, address _buyer, address _seller, uint _share) public view returns (bool) {
        return true;
    }

    function rentalCompilance(address _realty) public view returns (bool) {
        return true;
    }
}