pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./governance/WeightedMultiSig.sol"; 

// Multisig wallet (pattern) + fractional ownership
contract Ownership is Context, WeightedMultiSig {

    mapping(address => address) private approvals;

    constructor(address _cns, address[] memory _owners, uint[] memory _shares, Policy _policy) 
        Context(_cns) 
        WeightedMultiSig(_owners, _shares, _policy) 
    {
        require(_owners.length <= 100, "Max num of owners: 100");
        uint totalShares = 0;
        for (uint i = 0; i < _owners.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == 100, "Total shares must be equal to 100");
    }

    function approvedOf(address _addr) public view returns (address) {
        return approvals[_addr];
    }

    function approve(address _addr) public {
        require(shareOf(msg.sender) > 0, "Permission denied");
        // TODO se tiver sale open postada, retirar
        approvals[msg.sender] = _addr;
    }

    function canTransferShares(address _from, address _operator) public override pure returns (bool) {
        return approvedOf(_from) == _operator|| (approvedOf(_from) == address(0) && _operator == _from);
    }

}