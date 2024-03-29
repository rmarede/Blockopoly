pragma solidity ^0.8.0;

import "./utils/Context.sol";

// Multisig wallet (pattern) + fractional ownership
contract Ownership is Context {

    enum Policy { MAJORITY, UNANIMOUS } 

    mapping (address => uint) private shares;
    address[] private owners;
    mapping(address => address) private approvals;

    
    constructor(address _cns, address[] memory _owners, uint[] memory _shares, Policy _policy) Context(_cns) {
        require(_owners.length == _shares.length, "Invalid input");
        require(_owners.length <= 100, "Max num of owners: 100");

        uint totalShares = 0;
        for (uint i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0) && _shares[i] > 0, "Invalid input");
            shares[_owners[i]] = _shares[i];
            totalShares += _shares[i];
        }
        require(totalShares == 100, "Total shares must be equal to 100");
        owners = _owners;
        policy = _policy;
    }

    function transfer(address _from, address _to, uint _shares) public {
        require(approvedOf(_from) == msg.sender || (approvedOf(_from) == address(0) && msg.sender == _from), "Transfer not approved");
        require(shares[_from] >= _shares, "Insufficient shares");

        if (shares[_to] == 0) {
            owners.push(_to);
        }

        shares[_from] -= _shares;
        shares[_to] += _shares;

        if (shares[_from] == 0) {
            for (uint i = 0; i < owners.length; i++) {
                if (owners[i] == _from) {
                    owners[i] = owners[owners.length - 1];
                    owners.pop();
                    break;
                }
            }
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function sharesOf(address _addr) public view returns (uint) {
        return shares[_addr];
    }

    function approvedOf(address _addr) public view returns (address) {
        return approvals[_addr];
    }

    function approve(address _addr) public {
        require(shares[msg.sender] > 0, "Permission denied");
        // TODO se tiver sale open postada, retirar
        approvals[msg.sender] = _addr;
    }




    // MULTI SIG WALLET PATTERN IMPLEMENTATION
    // github.com/OpenZeppelin/gnosis-multisig -> TODO upgrade com openzeppelin Governor.sol

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    uint public transactionCount;
    Policy public policy;   

    function changePolicy(Policy _policy) public {
        require(msg.sender == address(this), "Permission denied");
        policy = _policy;
    }

    function submitTransaction(address destination, uint value, bytes memory data) public returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint transactionId) public 
        isOwner(msg.sender) 
        transactionExists(transactionId) 
        notConfirmed(transactionId, msg.sender) 
    {
        confirmations[transactionId][msg.sender] = true;
        executeTransaction(transactionId);
    }


    function executeTransaction(uint transactionId) public 
        isOwner(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "Transaction failed");
        }
    }

    function isConfirmed(uint transactionId) public view returns (bool) {
        if (policy == Policy.MAJORITY) {
            return getConfirmationCount(transactionId) > 50;
        } else if (policy == Policy.UNANIMOUS) {
            for (uint i=0; i<owners.length; i++)
                if (!confirmations[transactionId][owners[i]])
                    return false;
            return true;
        }
    }

    function getConfirmationCount(uint transactionId) public view returns (uint count) {
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]])
                count += shares[owners[i]];
    }



    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0));
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    modifier isOwner(address addr) {
        require(shares[msg.sender] > 0, "Permission denied");
        _;
    }


}