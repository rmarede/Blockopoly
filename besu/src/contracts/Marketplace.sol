// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./Realties.sol";
import "./Ownership.sol";
import "./Wallet.sol";
import "./utils/Context.sol";


contract Marketplace {} /* is Context {

    modifier isActive(uint saleId) {
        require(sales[saleId].status == SaleStatus.ACTIVE, "Marketplace: sale does not exist or is not active");
        _;
    }

    modifier isApproved(address assetId, address seller) {
        require(Ownership(assetId).approvedOf(seller) == address(this), "Marketplace: contract is not approved to sell this asset");
        _;
    }

    struct Sale {
        uint id;
        address asset;
        uint share;
        uint value;
        address seller;
        SaleStatus status;
        uint winningBid;
    }

    struct Bid {
        uint id;
        uint sale;
        uint value;
        address bidder;
        BidStatus status;
    }

    enum SaleStatus { ACTIVE, CLOSED, CANCELLED }
    enum BidStatus { ACTIVE, RETURNED, RETRIEVED }

    uint public saleCounter;
    mapping(uint => Sale) public sales;
    uint[] public activeSales; // Possivelmente remover com a introducao de eventos, faz se esta logica no cliente?
    mapping(address => uint[]) public salesOfAsset;

    uint public bidCounter;
    mapping(uint => Bid) public bids;
    mapping(uint => uint[]) public bidsBySale;
    mapping(address => uint[]) public userBids;
    
    constructor(address _cns) Context(_cns) {}

    function postSale(address _assetId, uint _share, uint _value) public isApproved(_assetId, msg.sender) returns (uint) {
        require(Ownership(_assetId).shareOf(msg.sender) >= _share, "Marketplace: caller does not own (enough) asset");
        require(!_isOnSale(_assetId), "Marketplace: asset already on sale");

        uint saleId = saleCounter++;
        salesOfAsset[_assetId].push(saleId);
        activeSales.push(saleId);
        sales[saleId] = Sale({
            id: saleId,
            asset: _assetId,
            share: _share,
            value: _value,
            seller: msg.sender,
            status: SaleStatus.ACTIVE,
            winningBid: 0
        });

        return saleId;
    }

    function bid(uint _saleId, uint _amount) public virtual isActive(_saleId) isApproved(sales[_saleId].asset, sales[_saleId].seller) {
        require(msg.sender != sales[_saleId].seller, "Marketplace: seller cannot bid on own sale");
        require(_amount >= sales[_saleId].value, "Marketplace: bid is too low");

        walletContract().transferFrom(msg.sender, address(this), _amount);

        uint bidId = bidCounter++;
        bidsBySale[_saleId].push(bidId);
        userBids[msg.sender].push(bidId);
        bids[bidId] = Bid({
            id: bidId,
            sale: _saleId,
            value: _amount,
            bidder: msg.sender,
            status: BidStatus.ACTIVE
        });
    }

    function retrieveBid(uint _bidId) public isActive(bids[_bidId].sale) {
        Bid storage b = bids[_bidId];
        require(b.bidder == msg.sender, "Marketplace: only bidder can retrieve bid");
        require(b.status == BidStatus.ACTIVE, "Marketplace: bid is not active");

        walletContract().transfer(msg.sender, b.value);
        b.status = BidStatus.RETRIEVED;
    }

    function closeSale(uint _saleId, uint _bidId) public virtual isActive(_saleId) isApproved(sales[_saleId].asset, sales[_saleId].seller) {
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can close deal");
        require(_saleHasBid(_saleId, _bidId), "Marketplace: sale has no such bid"); 
        require(bids[_bidId].status == BidStatus.ACTIVE, "Marketplace: bid was retrieved");

        Sale storage s = sales[_saleId];
        Bid storage b = bids[_bidId];

        s.winningBid = _bidId;
        s.status = SaleStatus.CLOSED;

        Ownership(s.asset).transferShares(s.seller, b.bidder, s.share);
        walletContract().transfer(s.seller, b.value);

        for (uint i = 0; i < bidsBySale[_saleId].length; i++) {
            Bid storage _otherBid = bids[bidsBySale[_saleId][i]];
            if (_otherBid.id != _bidId) {
                _otherBid.status = BidStatus.RETURNED;
                walletContract().transfer(_otherBid.bidder, _otherBid.value);
            }
        }
    }

    function cancelSale(uint _saleId) public virtual isActive(_saleId) {
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can cancel sale");

        Sale storage sale = sales[_saleId];
        sale.status = SaleStatus.CANCELLED;

        for (uint i = 0; i < bidsBySale[_saleId].length; i++) {
            Bid storage b = bids[bidsBySale[_saleId][i]];
            b.status = BidStatus.RETURNED;
            walletContract().transfer(b.bidder, b.value);
        }
    }

    function _arrayContains(uint[] memory array, uint target) private pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }
    
    function _isOnSale(address tokenId) private view returns (bool) {
        for (uint i = 0 ; i < salesOfAsset[tokenId].length; i++) {
            if (sales[salesOfAsset[tokenId][i]].status == SaleStatus.ACTIVE) {
                return true;
            }
        }
        return false;
    }

    function _saleHasBid(uint saleId, uint bidId) private view returns (bool) {
        for (uint i = 0; i < bidsBySale[saleId].length; i++) {
            if (bidsBySale[saleId][i] == bidId) {
                return true;
            }
        }
        return false;
    }

}
*/
