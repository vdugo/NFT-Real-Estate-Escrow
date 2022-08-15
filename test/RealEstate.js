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

            // check balance before the buyer deposits earnest
            balance = await escrow.getBalance()
            console.log(`Escrow balance before buyer deposits earnest: ${ethers.utils.formatEther(balance)}`)

            // buyer deposits earnest
            transaction = await escrow.connect(buyer).depositEarnest({value: ether(20)})
            await transaction.wait()

            // check escrow balance
            balance = await escrow.getBalance()
            console.log(`Escrow balance after buyer deposits earnest: ${ethers.utils.formatEther(balance)}`)

            // inspector updates status
            transaction = await escrow.connect(inspector).updateInspectionStatus(true)
            await transaction.wait()
            console.log('Inspector updates status')

            // buyer approves sale
            transaction = await escrow.connect(buyer).approveSale()
            await transaction.wait()

            // seller approves sale
            transaction = await escrow.connect(seller).approveSale()
            await transaction.wait()

            // lender funds the sale
            transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) })

            // lender approves sale
            transaction = await escrow.connect(lender).approveSale()
            await transaction.wait()

            // finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()

            // expect the owner of the real estate NFT to now be the buyer
            expect(await realEstate.ownerOf(NFT_ID)).to.equal(buyer.address)

            // expect the seller to receive the funds from both the down payment and the loan
            balance = await ethers.provider.getBalance(seller.address)
            console.log(`Seller balance after the sale: ${ethers.utils.formatEther(balance)}`)
            expect(balance).to.be.above(ether(10099))
        })
    })

})  