pragma solidity ^0.8.0;

import "../system/ContractNameService.sol";

contract Context { 

    ContractNameService private cns;
    address private cns_address;
    
    constructor(address _cns) {
        require(_cns != address(0), "Invalid CNS address");
        cns = ContractNameService(_cns);
        cns_address = _cns;
    }

    function setCns(address _cns) internal {
        require(_cns != address(0), "Already set");
        cns = ContractNameService(_cns);
    }

    function getCns() internal view returns (ContractNameService) {
        return cns;
    }

    function getCnsAddress() internal view returns (address) {
        return cns_address;
    }
}