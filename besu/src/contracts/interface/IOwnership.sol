pragma solidity ^0.8.0;

interface IOwnership {
    function shareOf(address _owner) external view returns (uint);
    function transferShares(address _from, address _to, uint _amount) external;
    function getParticipants() external view returns (address[] memory);
    function approve(address _addr) external;
    function approvedOf(address _addr) external view returns (address);
    function submitTransaction(address _destination, uint _value, bytes memory _data) external returns (uint transactionId);
    function confirmTransaction(uint _transactionId) external;
    function executeTransaction(uint _transactionId) external;
    function getConfirmationCount(uint _transactionId) external view returns (uint count);
}