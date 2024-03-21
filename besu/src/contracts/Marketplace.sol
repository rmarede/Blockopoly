
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./utils/Arrays.sol";
import "./interface/IERC721.sol";


contract Marketplace {

    address public constant ERC20_ADDRESS =0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc;
    address public constant ERC721_ADDRESS =0x777788889999AaAAbBbbCcccddDdeeeEfFFfCcCc;

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


    function postSale(uint256 tokenId) public virtual {
         // check if this contract has approvaL for the ERC721 token, no ERC721 so deixar dar set da unapproval se nao houver sale com estado "open"
        IERC721 erc721contract = IERC721(ERC721_ADDRESS);
        require(erc721contract.getApproved(tokenId) == address(this), "Marketplace: contract is not approved to sell this token");
        require(_sales[tokenId].value == 0, "Marketplace: sale already exists");

        _sales[tokenId] = Sale({
            id: Strings.toString(tokenId),
            value: 100,
            status: "open"
        });
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

    function closeSale(uint256 tokenId, uint256 bidId) public virtual {
        require(_sales[tokenId].value > 0, "Marketplace: sale does not exist");
        //require(_sales[tokenId].status == "open", "Marketplace: sale is not open");
        require(Arrays.arrayContains(_bidsBySale[tokenId], bidId), "Marketplace: sale has no such bid");

        IERC721 erc721contract = IERC721(ERC721_ADDRESS);
        address owner = erc721contract.ownerOf(tokenId);

        Bid memory bid = getBid(bidId);
        erc721contract.safeTransferFrom(owner, bid.bidder, tokenId);

        _sales[tokenId].status = "closed";
    }


}
