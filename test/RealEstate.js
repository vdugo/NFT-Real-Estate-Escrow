const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('RealEstate', () =>
{
    let realEstate, escrow
    let accounts, deployer, seller
    const NFT_ID = 1

    beforeEach(async () =>
    {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]

        const RealEstate = await ethers.getContractFactory('RealEstate')
        const Escrow = await ethers.getContractFactory('Escrow')

        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(realEstate.address, NFT_ID, seller.address, buyer.address)

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
        it('executes a successful transaction', async () =>
        {
            // expects the seller to be the NFT owner before the sale
            expect(await realEstate.ownerOf(NFT_ID)).to.equal(seller.address)

            // finalize the sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()

            expect(await realEstate.ownerOf(NFT_ID)).to.equal(buyer.address)
        })
    })

})  