// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "../utils/Strings.sol";
import "../utils/Context.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract AccountRegistry is IAccountRegistry, Context {

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    struct AccountDetails {
        address account;
        string orgId;
        string role;
        bool active;
    }

    AccountDetails[] private accountList;
    mapping(address => uint) private indexOf;


    constructor(address _cns) Context(_cns) {
        accountList.push(); // TODO verificar se isto da mm push e aumenta o tamanho do array
    }

    function addAccount(address _account, string memory _orgId, string memory _role) public override onlyMain {
        require(!accountExists(_account), "AccountRegistry: Account already exists");
        AccountDetails memory account = AccountDetails(_account, _orgId, _role, true);
        accountList.push(account);
        indexOf[_account] = accountList.length - 1;
    }

    function changeRoleOf(address _account, string memory _role) public override onlyMain {
        accountList[indexOf[_account]].role = _role;
    }

    function roleOf(address _account) public view override returns (string memory) {
        return accountList[indexOf[_account]].role;
    }

    function orgOf(address _account) public view override returns (string memory) {
        return accountList[indexOf[_account]].orgId;
    }

    function accountExists(address _account) public view override returns (bool) {
        return indexOf[_account] != 0;
    }

    function isActive(address _account) public view override returns (bool) {
        return accountList[indexOf[_account]].active;
    }

    function deactivateAccount(address _account) public override onlyMain {
        accountList[indexOf[_account]].active = false;
    }

    function activateAccount(address _account) public override onlyMain {
        accountList[indexOf[_account]].active = true;
    }

}