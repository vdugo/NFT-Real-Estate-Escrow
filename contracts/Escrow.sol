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

    modifier onlyBuyer()
    {
        require(msg.sender == buyer, "must be buyer");
        _;
    }

    modifier onlyInspector()
    {
        require(msg.sender == inspector, "must be inspector");
        _;
    }

    bool public inspectionPassed = false;
    // address -> boolean that lets us know if this entity has approved the transaction yet
    mapping(address => bool) public approval;

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

    function depositEarnest() public payable onlyBuyer
    {
        require(msg.value >= escrowAmount, "earnest not enough");
    }

    function updateInspectionStatus(bool _passed) public onlyInspector
    {
        inspectionPassed = _passed;
    }

    function approveSale() public
    {
        approval[msg.sender] = true;
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
        require(inspectionPassed, "must pass inspection");
        // require that each relevant person has approved the transaction
        require(approval[buyer], "must be approved by buyer");
        require(approval[seller], "must be approved by seller");
        require(approval[lender], "must be approved by lender");
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}