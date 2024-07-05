// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";
import "./interface/permissioning/IAccountRegistry.sol";
import "./utils/Strings.sol";
import "./governance/SelfMultisig.sol";
import "./compliance/Compliance.sol";

contract SaleAgreement is Context, SelfMultisig {

    event PreSaleAgreement(address indexed buyer, address indexed seller, address indexed realty);
    event DeedTransfer(address indexed buyer, address indexed seller, address indexed realty);
    event SaleWithdrawal(address indexed buyer, address indexed seller, address indexed realty);

    enum Status { PENDING, AGREED, COMPLETED, WITHDRAWN }

    struct SaleDetails {
        address buyer;
        address seller;
        address realty;
        uint share;
        uint price;
        uint earnest;
        address realtor;
        uint comission; // 100 is 1%
        uint contengencyPeriod; // TODO alguma coisa a fazer com isto?
        bytes contengencyClauses;
    }

    SaleDetails public details;
    Status public status;
    uint public createdAt;
    
    modifier onlyParties() {
        require(msg.sender == details.buyer || msg.sender == details.seller || msg.sender == address(this) || isPrivileged(msg.sender), "SaleAgreement: only buyer or seller can call this function");
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "SaleAgreement: this operation can only be invoked by consensus");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == details.seller, "SaleAgreement: only seller can call this function");
        _;
    }

    constructor(address _cns, SaleDetails memory _details) 
        Context(_cns) 
        SelfMultisig(_participants(_details.buyer, _details.seller), Policy.UNANIMOUS) 
    {
        require(_details.buyer != address(0) && _details.seller != address(0) && _details.realty != address(0), "SaleAgreement: invalid input");
        require(_details.price > 0 && _details.earnest > 0 && _details.share > 0, "SaleAgreement: invalid input");
        //require(_details.buyer != _details.seller, "SaleAgreement: buyer and seller can not be the same");
        require(_details.earnest <= _details.price, "SaleAgreement: earnest can not be more than price");
        require(_details.comission < 10000, "SaleAgreement: comission can not be more than 10000 (100.00%)");
        require(Ownership(_details.realty).shareOf(_details.seller) >= _details.share, "SaleAgreement: seller does not have enough shares");
        details = _details;
        status = Status.PENDING;
        createdAt = block.timestamp;
    }

    function consent() public onlyParties { // TODO mudar nome pre agreement, terms, consent, hold in escrow?
        require(status == Status.PENDING, "SaleAgreement: sale already agreed on");

        address complianceAddress = complianceAddress();
        if (complianceAddress != address(0)) {
            Compliance compliance = Compliance(complianceAddress);
            require(compliance.isCompliant(details.realty, "sale"), "SaleAgreement: realty not compliant for sale");
        }

        if (msg.sender == address(this)) {
            Ownership(details.realty).transferShares(details.seller, address(this), details.share);
            IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.earnest);
            status = Status.AGREED;
            emit PreSaleAgreement(details.buyer, details.seller, details.realty);
        } else {
            bytes memory data = abi.encodeWithSignature("consent()");
            for (uint i = 0; i < transactionCount; i++) {
                if (keccak256(transactions[i].data) == keccak256(data)) {
                    confirmTransaction(i);
                    return;
                }
            }
            submitTransaction(0, data);
        }
    }

    function commit() public onlyParties {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        if (msg.sender == address(this)) {
            IERC20(walletContractAddress()).transferFrom(details.buyer, address(this), details.price - details.earnest);
            uint comm = details.price * details.comission / 10000;
            IERC20(walletContractAddress()).transfer(details.realtor, comm);
            IERC20(walletContractAddress()).transfer(details.seller, details.price - comm);
            Ownership(details.realty).transferShares(address(this), details.buyer, details.share);
            emit DeedTransfer(details.buyer, details.seller, details.realty);
            status = Status.COMPLETED;
        } else {
            bytes memory data = abi.encodeWithSignature("commit()");
            for (uint i = 0; i < transactionCount; i++) {
                if (keccak256(transactions[i].data) == keccak256(data)) {
                    confirmTransaction(i);
                    return;
                }
            }
            submitTransaction(0, data);
        }
    }

    function withdraw(uint _penalty) public onlyParties {
        require(status == Status.AGREED, "SaleAgreement: sale already processed or not yet agreed on");
        require(_penalty <= details.earnest, "SaleAgreement: penalty can not be more than earnest");
        //require(block.timestamp - createdAt < details.contengencyPeriod, "SaleAgreement: contengency period already over");
        if (msg.sender == address(this) || isPrivileged(msg.sender)) {
            IERC20(walletContractAddress()).transfer(details.seller, _penalty);
            if (details.earnest - _penalty > 0) {
                IERC20(walletContractAddress()).transfer(details.buyer, details.earnest - _penalty);
            }
            Ownership(details.realty).transferShares(address(this), details.seller, details.share);
            status = Status.WITHDRAWN;
            emit SaleWithdrawal(details.buyer, details.seller, details.realty);
        } else {
            bytes memory data = abi.encodeWithSignature("withdraw(uint256)", _penalty);
            for (uint i = 0; i < transactionCount; i++) {
                if (keccak256(transactions[i].data) == keccak256(data)) {
                    confirmTransaction(i);
                    return;
                }
            }
            submitTransaction(0, data);
        }
    }

    function isPrivileged(address _address) private view returns (bool) {
        address accRegiAddr = accountRegistryAddress();
        if (accRegiAddr != address(0)) {
            return Strings.equals(IAccountRegistry(accRegiAddr).orgOf(_address), "admin_org");
        }
        return false;
    }

    function _participants(address _buyer, address _seller) private pure returns (address[] memory) {
        address[] memory res = new address[](2);
        res[0] = _buyer;
        res[1] = _seller;
        return res;
    }

    function getMultisignableName() public pure override returns (string memory) {
        return "SaleAgreement";
    }
}