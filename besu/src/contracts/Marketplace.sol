
pragma solidity ^0.8.0;

import "./utils/Strings.sol";
import "./interface/IERC721.sol";
import "./interface/IERC20.sol";
import "./utils/Context.sol";


contract Marketplace is Context {

    struct Sale {
        string id;
        uint share;
        uint256 value;
        address seller;
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

    
    constructor(address _cns) Context(_cns) {}

    function postSale(uint256 _tokenId, uint _share, uint _value) public virtual returns (bool) {
         // check if this contract has approvaL for the ERC721 token, no ERC721 so deixar dar set da unapproval se nao houver sale com estado "open"
        require(_getRealtyContract().getApproved(_tokenId) == address(this), "Marketplace: contract is not approved to sell this token");
        require(_sales[_tokenId].value == 0, "Marketplace: sale already exists");

        _sales[_tokenId] = Sale({
            id: Strings.toString(_tokenId),
            share: _share,
            value: _value,
            seller: msg.sender,
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

        address owner = _getRealtyContract().ownerOf(tokenId);

        Bid memory bid = getBid(bidId);
        _getRealtyContract().safeTransferFrom(owner, bid.bidder, tokenId);

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

    function _getRealtyContract() private view returns (IERC721) {
        return IERC721(getCns().getContractAddress("Realties"));
    }

    function _getWalletContract() private view returns (IERC20) {
        return IERC20(getCns().getContractAddress("Wallet"));
    }

}

