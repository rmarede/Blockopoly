// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/IERC20.sol";
import "../governance/Multisignable.sol";

contract MockWallet is IERC20, Multisignable {

    uint public mockBalance;
    uint public mockAllowance;
    bool public mockTransfer = true;
    bool public mockTransferFrom = true;

    constructor(address _cns) Multisignable(Policy.UNANIMOUS_OR_ADMIN) {}

    function decimals() public view virtual override returns (uint8) {
        return 2;
    }

    function mint(address to, uint amount) public virtual override returns (bool) {
        return true;
    }

    function burn(address to, uint amount) public virtual {
    }

    function balanceOf(address account) public view virtual override returns (uint) {
        return mockBalance;
    }

    function setBalanceOf(uint amount) public {
        mockBalance = amount;
    }

    function transfer(address to, uint amount) public virtual override returns (bool) {
        require(mockTransfer, "MockWallet: transfer not allowed");
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function setTransfer(bool value) public {
        mockTransfer = value;
    }

    function transferFrom(address from, address to, uint amount) public virtual override returns (bool) {
        require(mockTransferFrom, "MockWallet: transferFrom not allowed");
        emit Transfer(from, to, amount);
        return true;
    }

    function setTransferFrom(bool value) public {
        mockTransferFrom = value;
    }

    function approve(address spender, uint amount) public virtual override returns (bool) {
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint) {
        return mockAllowance;
    }

    function setAllowance(uint amount) public {
        mockAllowance = amount;
    }
    
}