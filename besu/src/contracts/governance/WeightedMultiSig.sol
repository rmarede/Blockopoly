pragma solidity ^0.8.0;

// WIGHTED MULTI SIGNATURE WALLET PATTERN IMPLEMENTATION
// github.com/OpenZeppelin/gnosis-multisig -> TODO maybe upgrade com openzeppelin Governor.sol
contract WeightedMultiSig {

    enum Policy { MAJORITY, UNANIMOUS } 

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
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

    address[] public participants; // TODO sera que queremos isto visivel para todos?
    mapping (address => uint) private shares; // TODO mudar nome para weight ou algo do genero
    uint totalShares;

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    uint public transactionCount;
    Policy public policy;   

    constructor (address[] memory _participants, uint[] memory _shares, Policy _policy) {
        require(_participants.length > 0, "No participants specified");
        require(_participants.length == _shares.length, "Invalid input");
        policy = _policy;
        for (uint i=0; i<_participants.length; i++) {
            require(_participants[i] != address(0) && _shares[i] > 0, "Invalid input");
            participants.push(_participants[i]);
            shares[_participants[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    function changePolicy(string memory _policy) public {
        require(msg.sender == address(this), "Permission denied");
        if (keccak256(abi.encodePacked(_policy)) == keccak256(abi.encodePacked("MAJORITY"))) {
            policy = Policy.MAJORITY;
        } else if (keccak256(abi.encodePacked(_policy)) == keccak256(abi.encodePacked("UNANIMOUS"))) {
            policy = Policy.UNANIMOUS;
        } else {
            revert("Invalid policy");
        }
    }

    function submitTransaction(address _destination, uint _value, bytes memory _data) public isOwner(msg.sender) returns (uint transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        confirmTransaction(transactionId);
    }

    function confirmTransaction(uint _transactionId) public 
        isOwner(msg.sender) 
        transactionExists(_transactionId) 
        notConfirmed(_transactionId, msg.sender) 
    {
        confirmations[_transactionId][msg.sender] = true;
        executeTransaction(_transactionId);
    }

    function executeTransaction(uint _transactionId) public 
        isOwner(msg.sender)
        confirmed(_transactionId, msg.sender)
        notExecuted(_transactionId)
    {
        if (isConfirmed(_transactionId)) {
            Transaction storage txn = transactions[_transactionId];
            (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
            txn.executed = true;
            require(success, "Transaction failed");
        }
    }

    function isConfirmed(uint _transactionId) public view returns (bool) {
        if (policy == Policy.MAJORITY) {
            return getConfirmationCount(_transactionId) > totalShares / 2;
        } else if (policy == Policy.UNANIMOUS) {
            for (uint i=0; i<participants.length; i++)
                if (!confirmations[_transactionId][participants[i]])
                    return false;
            return true;
        }
    }

    function getConfirmationCount(uint _transactionId) public view returns (uint count) {
        for (uint i=0; i<participants.length; i++)
            if (confirmations[_transactionId][participants[i]])
                count += shares[participants[i]];
    }

    function shareOf(address _owner) public view returns (uint) {
        return shares[_owner];
    }

    function transferShares(address _from, address _to, uint _amount) public {
        require(canTransferShares(_from, msg.sender), "Permission denied");
        require(shares[_from] >= _amount, "Not enough shares");

        if (shares[_to] == 0) { // TODO fazer override desta funcao no ownership para atualizar no realties
            participants.push(_to);
        }

        shares[_from] -= _amount;
        shares[_to] += _amount;

        if (shares[_from] == 0) {  // TODO fazer override desta funcao no ownership para atualizar no realties
            for (uint i = 0; i < participants.length; i++) {
                if (participants[i] == _from) {
                    participants[i] = participants[participants.length - 1];
                    participants.pop();
                    break;
                }
            }
        }
    }

    function addShares(address to, uint amount) public {
        require(canAddShares(msg.sender), "Permission denied");

        if (shares[to] == 0) {  // TODO fazer override desta funcao no ownership para atualizar no realties
            participants.push(to);
        }

        shares[to] = amount;
        totalShares += amount;
    }

    function removeShares(address from, uint amount) public {
        require(canRemoveShares(msg.sender), "Permission denied");
        require(shares[from] > amount, "Not enough shares");

        shares[from] -= amount;
        totalShares -= amount;

        if (shares[from] == 0) {  // fazer override desta funcao no ownership para atualizar no realties
            for (uint i = 0; i < participants.length; i++) {
                if (participants[i] == from) {
                    participants[i] = participants[participants.length - 1];
                    participants.pop();
                    break;
                }
            }
        }
    }

    function canAddShares(address operator) public view virtual returns (bool) {
        return operator == address(this);
    }

    function canRemoveShares(address operator) public view virtual returns (bool) {
        return operator == address(this);
    }

    function canTransferShares(address from, address operator) public view virtual returns (bool) {
        return from == operator;
    }

}