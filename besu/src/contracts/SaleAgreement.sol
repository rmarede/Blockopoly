// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Context.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";


contract SaleAgreement is Context {

    address public realty;
    address public buyer;
    address public seller;
    uint public price;
    uint public share;
    address public realtor;
    uint public comission; // 100 is 1%

    bool private buyerSignature;
    bool private sellerSignature;

    modifier onlyParties() {
        require(msg.sender == buyer || msg.sender == seller, "SaleAgreement: only buyer or seller can call this function");
        _;
    }

    modifier unsigned() {
        require(!buyerSignature || !sellerSignature, "SaleAgreement: already signed");
        _;
    }

    modifier signed() {
        require(buyerSignature && sellerSignature, "SaleAgreement: agreement not signed");
        _;
    }


    constructor(address _cns, address _realty, address _buyer, address _seller, uint _price, uint _share, address _realtor, uint _comission) Context(_cns) {
        require(_price > 0 && _share > 0, "SaleAgreement: invalid input");
        require(_comission < 10000, "SaleAgreement: comission can not be more than 10000 (100.00%)");
        require(Ownership(_realty).shareOf(_seller) >= _share, "SaleAgreement: seller does not have enough shares");
        realty = _realty;
        buyer = _buyer;
        seller = _seller;
        price = _price;
        share = _share;
        realtor = _realtor;
        comission = _comission;
    }

    function sign() public onlyParties unsigned {
        if (msg.sender == buyer) {
            require(!buyerSignature, "SaleAgreement: this party has already signed");
            IERC20(walletContractAddress()).transferFrom(buyer, address(this), price);
            buyerSignature = true;
        } else {
            require(buyerSignature, "SaleAgreement: buyer has to sign first");
            sellerSignature = true;
            transfer();
        }
    }

    function transfer() private signed {
        Ownership(realty).transferShares(seller, buyer, share);
        uint comm = price * comission / 10000;
        IERC20(walletContractAddress()).transfer(realtor, comm);
        IERC20(walletContractAddress()).transfer(seller, price - comm);
    }

    function widthdraw() public unsigned onlyParties {
        require(buyerSignature, "SaleAgreement: nothing to widthdraw");
        IERC20(walletContractAddress()).transfer(buyer, price);
        buyerSignature = false;
    }




    
}