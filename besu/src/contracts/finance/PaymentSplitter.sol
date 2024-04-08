// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../Wallet.sol";

contract PaymentSplitter is Context {

    event PaymentReleased(address to, uint amount);
    event PaymentReceived(address from, uint amount);

    mapping(address => uint) private shares;
    address[] private payees;
    uint256 private totalShares;

    constructor(address[] memory _payees, uint[] memory _shares, address _cns) Context(_cns) {
        require(_payees.length == _shares.length, "PaymentSplitter: payees and shares length mismatch");
        //require(_payees.length > 0, "PaymentSplitter: no payees");

        for (uint i = 0; i < _payees.length; i++) {
            editPayee(_payees[i], _shares[i]);
        }
    }

    function sharesOf(address account) public virtual view returns (uint) {
        return shares[account];
    }

    function getPayees() public virtual view returns (address[] memory) {
        return payees;
    }

    function getTotalShares() public virtual view returns (uint) {
        return totalShares;
    }

    function pay(uint _amount) public virtual {
        require(_amount > 0, "PaymentSplitter: amount is 0");
        for (uint i = 0; i < getPayees().length; i++) {
            address payee = getPayees()[i];
            uint payment = _amount * sharesOf(payee) / getTotalShares(); 
            _walletContract().transferFrom(msg.sender, payee, payment);
            //emit PaymentReleased(payee, payment);
        }
    }

    function payFrom(address _from, uint _amount) internal virtual { // TODO ou publica e override? ou deixar so esta e apagar a pay?
        require(_amount > 0, "PaymentSplitter: amount is 0");
        for (uint i = 0; i < getPayees().length; i++) {
            address payee = getPayees()[i];
            uint payment = _amount * sharesOf(payee) / getTotalShares(); 
            _walletContract().transferFrom(_from, payee, payment);
            //emit PaymentReleased(payee, payment);
        }
    }

    function editPayee(address _account, uint _shares) private {
        require(_canEditPayees(msg.sender), "PaymentSplitter: caller is not allowed to edit payees");
        require(_account != address(0), "PaymentSplitter: invalid input");
        require(_shares > 0, "PaymentSplitter: shares are 0");

        if(shares[_account] == 0) {
            payees.push(_account);
        }
        shares[_account] = _shares;
        totalShares = totalShares + _shares;
    }

    function _canEditPayees(address _operator) internal virtual view returns (bool) {
        return _operator == address(this);
    }

    function _walletContract() internal view returns (Wallet) {
        return Wallet(cns.getContractAddress("Wallet"));
    }

}