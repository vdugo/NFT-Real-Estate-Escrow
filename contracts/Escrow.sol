// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Escrow
{
    address public nftAddress;
    uint256 public nftId;
    address payable public seller;
    address payable public buyer;

    constructor(address _nftAddress, uint256 _nftId, address payable _seller, address payable _buyer)
    {
        nftAddress = _nftAddress;
        nftId = _nftId;
        seller = _seller;
        buyer = _buyer;
    }

    /**
     * @dev Transfers ownership of the property
     */
    function finalizeSale() public
    {
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}