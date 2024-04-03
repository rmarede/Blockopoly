// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./Realties.sol";
import "./Ownership.sol";
import "./interface/IERC20.sol";
import "./utils/Context.sol";


contract Marketplace is Context {

    modifier isActive(uint saleId) {
        require(sales[saleId].status == SaleStatus.ACTIVE, "Marketplace: sale does not exist or is not active");
        _;
    }

    modifier isApproved(address assetId, address seller) {
        require(_ownershipContract(assetId).approvedOf(seller) == address(this), "Marketplace: contract is not approved to sell this asset");
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
    enum BidStatus { ACTIVE, RETRIEVED }

    uint public saleCounter;
    Sale[] public sales;
    uint[] public activeSales;
    mapping(address => uint[]) public salesOfAsset;


    uint public bidCounter;
    mapping(uint => Bid) public bids;
    mapping(uint => uint[]) public bidsBySale;
    mapping(address => uint[]) public userBids;

    
    constructor(address _cns) Context(_cns) {}

    function postSale(address _assetId, uint _share, uint _value) public isApproved(_assetId, msg.sender) {
        require(_ownershipContract(_assetId).shares(msg.sender) >= _share, "Marketplace: caller does not own (enough) asset");
        require(!_isOnSale(_assetId), "Marketplace: asset already on sale");

        Sale memory sale = Sale({
            id: ++saleCounter,
            asset: _assetId,
            share: _share,
            value: _value,
            seller: msg.sender,
            status: SaleStatus.ACTIVE,
            winningBid: 0
        });

        sales.push(sale);
        salesOfAsset[_assetId].push(saleCounter);
        activeSales.push(saleCounter);

    }

    function bid(uint _saleId, uint _value) public virtual isActive(_saleId) isApproved(sales[_saleId].asset, sales[_saleId].seller) {
        require(msg.sender != sales[_saleId].seller, "Marketplace: seller cannot bid on own sale");
        require(_value > sales[_saleId].value, "Marketplace: bid is too low");

        Bid memory b = Bid({
            id: ++bidCounter,
            sale: _saleId,
            value: _value,
            bidder: msg.sender,
            status: BidStatus.ACTIVE
        });

        bids[bidCounter] = b;
        bidsBySale[_saleId].push(bidCounter);
        userBids[msg.sender].push(bidCounter);

        // TODO transferir montante para o contrato e criar funcao para ver quanto o contrato tem bloqueado dos utilizadores

    }

    function retrieveBid(uint _bidId) public isActive(bids[_bidId].sale) {
        require(bids[_bidId].bidder == msg.sender, "Marketplace: only bidder can retrieve bid");
        require(bids[_bidId].status == BidStatus.ACTIVE, "Marketplace: bid is not active");

        bids[_bidId].status = BidStatus.RETRIEVED;

        // TODO devolver montante ao bidder
    }

    function closeSale(uint _saleId, uint _bidId) public virtual isActive(_saleId) isApproved(sales[_saleId].asset, sales[_saleId].seller) {
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can close deal");
        require(bids[_bidId].sale == _saleId, "Marketplace: sale has no such bid");
        require(bids[_bidId].status == BidStatus.ACTIVE, "Marketplace: bid was retrieved");

        Sale storage sale = sales[_saleId];

        sale.status = SaleStatus.CLOSED;
        sale.winningBid = _bidId;

        _ownershipContract(sale.asset).transferShares(sale.seller, bids[_bidId].bidder, sale.share);

        // TODO mover montantes (partes e resto dos bidders)
    }

    function cancelSale(uint _saleId) public virtual isActive(_saleId) {
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can cancel sale");

        Sale storage sale = sales[_saleId];
        sale.status = SaleStatus.CANCELLED;

        // TODO devolver montantes a todos os bidders
    }

    function _arrayContains(uint[] memory array, uint target) private pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }

    function _realtyContract() private view returns (Realties) {
        return Realties(cns.getContractAddress("Realties"));
    }

    function _ownershipContract(address _asset) private view returns (Ownership) {
        return Ownership(_asset);
    }

    function _walletContract() private view returns (IERC20) {
        return IERC20(cns.getContractAddress("Wallet"));
    }
    
    function _isOnSale(address tokenId) private view returns (bool) {
        for (uint i = 0 ; i < salesOfAsset[tokenId].length; i++) {
            if (sales[salesOfAsset[tokenId][i]].status == SaleStatus.ACTIVE) {
                return true;
            }
        }
        return false;
    }

}

