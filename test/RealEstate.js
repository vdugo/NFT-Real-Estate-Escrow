const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) =>
{
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('RealEstate', () =>
{
    let realEstate, escrow
    let accounts, deployer, seller, buyer, inspector, lender
    const NFT_ID = 1
    const PURCHASE_PRICE = ether(100)
    const ESCROW_AMOUNT = ether(20)

    beforeEach(async () =>
    {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]
        inspector = accounts[2]
        lender = accounts[3]

        const RealEstate = await ethers.getContractFactory('RealEstate')
        const Escrow = await ethers.getContractFactory('Escrow')

        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(
            realEstate.address, 
            NFT_ID, 
            PURCHASE_PRICE,
            ESCROW_AMOUNT,
            seller.address, 
            buyer.address,
            inspector.address,
            lender.address
            )

        // seller approves NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, NFT_ID)
        await transaction.wait()
    })

    describe('Deployment', async () =>
    {
        it('sends an NFT to the seller / deployer', async () =>
        {
            expect(await realEstate.ownerOf(NFT_ID)).to.equal(seller.address)
        })
    })

    describe('Selling real estate', async () =>
    {
        let balance, transaction

        it('executes a successful transaction', async () =>
        {
            // expects the seller to be the NFT owner before the sale
            expect(await realEstate.ownerOf(NFT_ID)).to.equal(seller.address)

            // buyer deposits earnest
            transaction = await escrow.connect(buyer).depositEarnest({value: ESCROW_AMOUNT})

            // finalize the sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()

            expect(await realEstate.ownerOf(NFT_ID)).to.equal(buyer.address)
        })
    })

})  