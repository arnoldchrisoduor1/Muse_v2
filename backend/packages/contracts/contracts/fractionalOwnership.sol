// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FractionalOwnership
 * @dev Simple fractional ownership contract
 */
contract FractionalOwnership is ERC20, Ownable {
    IERC721 public nftContract;
    uint256 public nftTokenId;
    uint256 public totalShares;
    uint256 public sharePrice;
    bool public isFractionalized;

    event NFTFractionalized(
        uint256 indexed tokenId,
        uint256 totalShares,
        uint256 sharePrice
    );

    constructor() ERC20("Fractional NFT Share", "FNFT") Ownable(msg.sender) {}

    /**
     * @dev Initialize fractional ownership for an NFT
     */
    function fractionalize(
        address _nftContract,
        uint256 _tokenId,
        uint256 _totalShares,
        uint256 _sharePrice
    ) external onlyOwner {
        require(!isFractionalized, "Already fractionalized");
        require(_totalShares > 0, "Invalid total shares");

        nftContract = IERC721(_nftContract);
        nftTokenId = _tokenId;
        totalShares = _totalShares;
        sharePrice = _sharePrice;
        isFractionalized = true;

        // Mint fractional tokens
        _mint(msg.sender, _totalShares);

        emit NFTFractionalized(_tokenId, _totalShares, _sharePrice);
    }

    /**
     * @dev Purchase shares
     */
    function purchaseShares(uint256 shares) external payable {
        require(isFractionalized, "Not fractionalized");
        require(shares > 0, "Invalid shares");
        require(balanceOf(owner()) >= shares, "Insufficient shares available");

        // Transfer shares from owner to buyer
        _transfer(owner(), msg.sender, shares);

        // In a real implementation, you'd handle payment here
    }
}