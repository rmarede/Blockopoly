// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "../utils/Context.sol";
import "../interface/permissioning/IAccountRegistry.sol";

contract AccountRegistry is IAccountRegistry, Context {

    modifier onlyMain() {
        require(msg.sender == permissionEndpointsAddress(), "OrganizationRegistry: Permission denied");
        _;
    }

    AccountDetails[] private accountList;
    mapping(address => uint) private indexOf;


    constructor(address _cns) Context(_cns) {
        accountList.push();
    }

    function addAccount(address _account, string memory _orgId, string memory _role, bool _isAdmin) public override onlyMain {
        require(!accountExists(_account), "AccountRegistry: Account already exists");
        AccountDetails memory account = AccountDetails(_account, _orgId, _role, _isAdmin, true);
        accountList.push(account);
        indexOf[_account] = accountList.length - 1;
        emit AccountAdded(_account, _orgId, _role, _isAdmin);
    }

    function changeRoleOf(address _account, string memory _role) public override onlyMain {
        accountList[indexOf[_account]].role = _role;
        emit AccountRoleChanged(_account, _role);
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

    function isAdmin(address _account) public view override returns (bool) {
        return accountList[indexOf[_account]].isAdmin;
    }

    function isActive(address _account) public view override returns (bool) {
        return accountList[indexOf[_account]].active;
    }

    function deactivateAccount(address _account) public override onlyMain {
        accountList[indexOf[_account]].active = false;
        emit AccountDeactivated(_account);
    }

    function activateAccount(address _account) public override onlyMain {
        accountList[indexOf[_account]].active = true;
        emit AccountActivated(_account);
    }

}