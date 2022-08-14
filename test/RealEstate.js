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

        const RealEstate = await ethers.getContractFactory('RealEstate')
        const Escrow = await ethers.getContractFactory('Escrow')

        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(realEstate.address, NFT_ID)
    })

    describe('Deployment', async () =>
    {
        it('sends an NFT to the seller / deployer', async () =>
        {
            expect(await realEstate.ownerOf(NFT_ID)).to.equal(seller.address)
        })
    })

})  