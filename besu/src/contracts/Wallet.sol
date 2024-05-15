// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IERC20.sol";
import "./utils/Context.sol";
import "./interface/permissioning/IRoleRegistry.sol";
import "./interface/permissioning/IAccountRegistry.sol";

// Inspired by OpenZeppelin Contracts (token/ERC20/ERC20.sol) - last updated v4.7.0

contract Wallet is IERC20, Context {

    mapping(address => uint) private balances;
    mapping(address => mapping(address => uint)) private allowances;

    constructor(address _cns) Context(_cns) {}

    function decimals() public view virtual override returns (uint8) {
        return 2;
    }

    function mint(address to, uint amount) public virtual returns (bool) {
        require(to != address(0) && amount > 0, "Wallet: invalid input");
        require(IRoleRegistry(roleRegistryAddress()).canMintCurrency(IAccountRegistry(accountRegistryAddress()).roleOf(msg.sender)), "Wallet: sender does not have permission to mint");

        balances[to] += amount;
        return true;
    }

    function burn(address to, uint amount) public virtual {
        require(to != address(0), "Wallet: invalid input");
        require(balances[to] >= amount, "Wallet: insufficient funds to burn");
        balances[to] -= amount;
    }

    function balanceOf(address account) public view virtual returns (uint) {
        return balances[account];
    }

    function transfer(address to, uint amount) public virtual returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint amount) public virtual returns (bool) {
        if (msg.sender != from) {
            _spendAllowance(from, msg.sender, amount);
        }
        _transfer(from, to, amount);
        return true;
    }


    function approve(address spender, uint amount) public virtual returns (bool) {
        require(spender != address(0), "Wallet: invalid input");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint) {
        return allowances[owner][spender];
    }

    function _transfer(address from, address to, uint amount) internal virtual {
        require(from != address(0) && to != address(0), "Wallet: invalid input");
        uint fromBalance = balances[from];
        require(fromBalance >= amount, "Wallet: insufficient funds");
        
        balances[from] = fromBalance - amount;
        balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _spendAllowance(address owner, address spender, uint amount) internal virtual {
        uint currentAllowance = allowance(owner, spender);
        require(currentAllowance >= amount, "Wallet: insufficient allowance");
        allowances[owner][spender] = currentAllowance - amount;
    }
    
}