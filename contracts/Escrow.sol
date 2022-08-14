// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Escrow
{
    address public nftAddress;
    uint256 public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    constructor(
        address _nftAddress, 
        uint256 _nftId, 
        uint256 _purchasePrice,
        uint256 _escrowAmount, 
        address payable _seller, 
        address payable _buyer,
        address _inspector,
        address _lender
        )
    {
        nftAddress = _nftAddress;
        nftId = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }

    function depositEarnest() public payable
    {
        require(msg.value >= escrowAmount, "earnest not enough");
        require(msg.sender == buyer, "must be buyer");
    }

    function getBalance() public view returns(uint256)
    {
        return address(this).balance;
    }

    /**
     * @dev Transfers ownership of the property
     */
    function finalizeSale() public
    {
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}