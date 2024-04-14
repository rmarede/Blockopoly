// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../Wallet.sol";

contract PaymentSplitter is Context {

    event PaymentReleased(address to, uint amount);
    event PaymentReceived(address from, uint amount);

    mapping(address => uint) public shares;
    address[] public payees;
    uint256 public totalShares;

    constructor(address[] memory _payees, uint[] memory _shares, address _cns) Context(_cns) {
        require(_payees.length == _shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(_payees.length > 0, "PaymentSplitter: no payees");

        for (uint i = 0; i < _payees.length; i++) {
            require(_payees[i] != address(0) && _shares[i] > 0, "PaymentSplitter: invalid input");
            require(shares[_payees[i]] == 0, "PaymentSplitter: duplicate payee");
            payees.push(_payees[i]);
            shares[_payees[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    function sharesOf(address account) public virtual view returns (uint) {
        return shares[account];
    }

    function getPayees() public virtual view returns (address[] memory) {
        return payees;
    }

    function pay(uint _amount) public virtual {
        require(_amount > 0, "PaymentSplitter: amount is 0");
        for (uint i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint payment = _amount * sharesOf(payee) / totalShares; 
            walletContract().transferFrom(msg.sender, payee, payment);
            //emit PaymentReleased(payee, payment);
        }
    }

    function payFrom(address _from, uint _amount) public virtual { // TODO override desta para nao permitir que paguem por outros
        require(_amount > 0, "PaymentSplitter: amount is 0");
        for (uint i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint payment = _amount * sharesOf(payee) / totalShares; 
            walletContract().transferFrom(_from, payee, payment);
            //emit PaymentReleased(payee, payment);
        }
    }

    // In case ownership changes, it is necessary to update the payees
    function editPayee(address _account, uint _shares) private {
        require(_canEditPayees(msg.sender), "PaymentSplitter: caller is not allowed to edit payees");
        require(_account != address(0) && _shares > 0, "PaymentSplitter: invalid input");
        uint prev_shares = shares[_account];
        if(prev_shares == 0) {
            payees.push(_account);
        }
        shares[_account] = _shares;
        totalShares = totalShares + _shares - prev_shares;
    }

    function _canEditPayees(address _operator) internal virtual view returns (bool) {
        return _operator == address(this);
    }

}