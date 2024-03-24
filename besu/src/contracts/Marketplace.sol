
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./interface/IERC721.sol";


contract Marketplace {

    address private _erc20address;
    address private _erc721address;

    struct Sale {
        string id;
        uint256 value;
        string status;
    }

    struct Bid {
        string id;
        uint256 value;
        address bidder;
    }

    uint256 private bidCounter = 0;
    mapping(uint256 => Sale) private _sales;
    mapping(uint256 => Bid) private _bids;
    mapping(uint256 => uint256[]) private _bidsBySale;

    
    constructor(address erc20Address, address erc721Address) {
        _erc20address = erc20Address;
        _erc721address = erc721Address;
    }

    function postSale(uint256 tokenId) public virtual returns (bool) {
         // check if this contract has approvaL for the ERC721 token, no ERC721 so deixar dar set da unapproval se nao houver sale com estado "open"
        IERC721 erc721contract = IERC721(_erc721address);
        require(erc721contract.getApproved(tokenId) == address(this), "Marketplace: contract is not approved to sell this token");
        require(_sales[tokenId].value == 0, "Marketplace: sale already exists");

        _sales[tokenId] = Sale({
            id: Strings.toString(tokenId),
            value: 100,
            status: "open"
        });

        return true;
    }

    function getSale(uint256 tokenId) public view virtual returns (Sale memory) {
        return _sales[tokenId];
    }

    function bid(uint256 tokenId, uint256 value) public virtual {
        require(_sales[tokenId].value > 0, "Marketplace: sale does not exist");
        require(value > _sales[tokenId].value, "Marketplace: bid is too low");

        _bids[bidCounter] = Bid({
            id: Strings.toString(bidCounter),
            value: value,
            bidder: msg.sender
        });

        _bidsBySale[tokenId].push(bidCounter);

        bidCounter++;

    }

    function getBid(uint256 bidId) public view virtual returns (Bid memory) {
        return _bids[bidId];
    }

    function getSaleBids(uint256 tokenId) public view virtual returns (Bid[] memory) {
        uint256[] memory bidsIds = _bidsBySale[tokenId];
        Bid[] memory bids = new Bid[](bidsIds.length);

        for (uint i = 0; i < bidsIds.length; i++) {
            bids[i] = getBid(bidsIds[i]);
        }

        return bids;
    }

    function closeSale(uint256 tokenId, uint256 bidId) public virtual {
        require(_sales[tokenId].value > 0, "Marketplace: sale does not exist");
        //require(_sales[tokenId].status == "open", "Marketplace: sale is not open");
        require(_arrayContains(_bidsBySale[tokenId], bidId), "Marketplace: sale has no such bid");

        IERC721 erc721contract = IERC721(_erc721address);
        address owner = erc721contract.ownerOf(tokenId);

        Bid memory bid = getBid(bidId);
        erc721contract.safeTransferFrom(owner, bid.bidder, tokenId);

        _sales[tokenId].status = "closed";
    }

    function _arrayContains(uint256[] memory array, uint256 target) private pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }


}

