// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./Realties.sol";
import "./Ownership.sol";
import "./Wallet.sol";
import "./SaleAgreement.sol";
import "./utils/Context.sol";
import "./utils/Arraysz.sol";


contract Marketplace is Context {

    struct Sale { // TODO realtor e comission onde?
        uint id;
        address asset;
        uint share;
        uint price;
        address seller;
        bytes contengencyClauses;
        SaleStatus status;
        uint winningBid;
    }

    struct Bid {
        uint sale;
        uint value;
        address bidder;
        bytes contengencyClauses;
    }

    enum SaleStatus { ACTIVE, CLOSED, CANCELLED }

    uint public saleCounter;
    mapping(uint => Sale) public sales;
    uint[] public activeSales; 
    mapping(address => address[]) public salesOfAsset;

    mapping(uint => Bid[]) public bidsBySale;
    mapping(address => uint[]) public bidsByUser;
   
    constructor(address _cns) Context(_cns) {}

    function postSale(address _assetId, uint _share, uint _price, bytes memory _contengencyClauses) public returns (uint) {
        require(Ownership(_assetId).shareOf(msg.sender) >= _share, "Marketplace: caller does not own (enough) asset");

        uint saleId = saleCounter++;
        sales[saleId] = Sale({
            id: saleId,
            asset: _assetId,
            share: _share,
            price: _price,
            seller: msg.sender,
            contengencyClauses: _contengencyClauses,
            status: SaleStatus.ACTIVE,
            winningBid: 0
        });
        activeSales.push(saleId);

        return saleId;
    }

    function bid(uint _saleId, uint _value, bytes memory _contengencyClauses) public {
        require(msg.sender != sales[_saleId].seller, "Marketplace: seller cannot bid on own sale");

        for (uint i = 0; i < bidsBySale[_saleId].length; i++) {
            require(bidsBySale[_saleId][i].bidder != msg.sender, "Marketplace: user already has bid on this sale");
        }

        bidsBySale[_saleId].push(Bid({
            sale: _saleId,
            value: _value,
            bidder: msg.sender,
            contengencyClauses: _contengencyClauses
        }));
        bidsByUser[msg.sender].push(_saleId);
    }

    function retrieveBid(uint _saleId) public {
        require(sales[_saleId].status == SaleStatus.ACTIVE, "Marketplace: bid is not active");
        uint bidIndex = _indexOfBid(_saleId, msg.sender);
        require(bidIndex < bidsBySale[_saleId].length, "Marketplace: bid not found");
        delete bidsBySale[_saleId][bidIndex];
    }

    function closeSale(uint _saleId, uint _bid, uint _earnest) public returns (address){
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can close sale");
        require(sales[_saleId].status == SaleStatus.ACTIVE, "Marketplace: sale is not active");
        require(_bid < bidsBySale[_saleId].length, "Marketplace: invalid bid index");

        Sale storage sale = sales[_saleId];
        Bid storage bid = bidsBySale[_saleId][_bid];
        sale.status = SaleStatus.CLOSED;
        sale.winningBid = _bid;

        for (uint i = 0; i < activeSales.length; i++) {
            if(activeSales[i] == _saleId) {
                delete activeSales[i]; // TODO verificar se nao fica com buraco
            }
        }

        SaleAgreement.SaleDetails memory details = SaleAgreement.SaleDetails(
            bid.bidder,
            sale.seller, 
            sale.asset, 
            sale.share, 
            bid.value, 
            _earnest,
            msg.sender, // TODO realtor
            0, // TODO comission
            0, // TODO contengencyPeriod 
            Arraysz.mergeBytes(sale.contengencyClauses, bid.contengencyClauses));

        SaleAgreement agreement = new SaleAgreement(cns_address, details);
        salesOfAsset[sale.asset].push(address(agreement));
        return address(agreement);
    }

    function cancelSale(uint _saleId) public {
        require(msg.sender == sales[_saleId].seller, "Marketplace: only seller can cancel sale");

        Sale storage sale = sales[_saleId];
        sale.status = SaleStatus.CANCELLED;

        for (uint i = 0; i < activeSales.length; i++) {
            if(activeSales[i] == _saleId) {
                delete activeSales[i]; // TODO verificar se nao fica com buraco
            }
        }
    }

    /* 
    * @dev Returns the index of the bid of a given sale and bidder. If the bid does not exist, returns the length of the array.
    * @param _saleId The id of the sale
    * @param _bidder The address of the bidder
    * @return The index of the bid
    */
    function _indexOfBid(uint _saleId, address _bidder) private view returns (uint) {
        for (uint i = 0; i < bidsBySale[_saleId].length; i++) {
            if(bidsBySale[_saleId][i].bidder == _bidder) {
                return i;
            }
        }
        return bidsBySale[_saleId].length;
    }
}
