const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');
const abi_encoder = require('../scripts/utils/abi-data-encoder');

const textEncoder = new TextEncoder();
  
describe("SaleAgreement", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }
    
    async function deploySaleAgreementFixture() {
        const [acc1, acc2, acc3] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("MockWallet");
        const wallet = await Wallet.deploy(cns.target);
        const RealtyFactory = await ethers.getContractFactory("MockRealtyFactory");
        const realtyFactory = await RealtyFactory.deploy(cns.target);
        const Ownership = await ethers.getContractFactory("MockOwnership");
        const ownership = await Ownership.deploy([],[]);

        ownership.setMockShare(3000);

        await cns.setContractAddress("Wallet", wallet.target);
        await cns.setContractAddress("RealtyFactory", realtyFactory.target);

        const details = {
            buyer: acc3.address,
            seller: acc2.address,
            realty: ownership.target,
            share: 3000,
            price: 10000,
            earnest: 100,
            realtor: acc1.address,
            comission: 5,
            contengencyPeriod: 10000, // TODO
            contengencyClauses: textEncoder.encode("foo")
        }

        const contract = await ethers.getContractFactory("SaleAgreement");
        const saleAgreement = await contract.deploy(cns.target, details);
        return {saleAgreement, wallet, ownership, realtyFactory};
    }

    describe("Deployment", function () {
        it("Should deploy SaleAgreement", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            expect(await saleAgreement.details()).to.exist;
            expect(await saleAgreement.participantExists(acc1.address)).to.be.false;
            expect(await saleAgreement.participantExists(acc2.address)).to.be.true;
            expect(await saleAgreement.participantExists(acc3.address)).to.be.true;
        });
    }); 

    describe("Consent", function () {
        
        it("Should not consent if wallet transfer fails", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            wallet.setTransferFrom(false);

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).to.be.reverted;
        });

        it("Should not consent if ownership transfer fails", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            ownership.setMockTransferShares(false);

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).to.be.reverted;
        });
        
        it("Should not consent after already consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).consent()).to.be.reverted;
        });

        it("Should hold assets in escrow when both consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            expect(await saleAgreement.status()).to.equal(0);
            await expect(saleAgreement.connect(acc3).consent())
                .to.emit(wallet, "Transfer").withArgs(acc3.address, saleAgreement.target, 100)
                .to.emit(ownership, "OwnershipTransfer").withArgs(acc2.address, saleAgreement.target, 3000);
            expect(await saleAgreement.status()).to.equal(1);
        });
    }); 

    describe("Commit", function () {
        it("Should not commit if not yet consented by both parties", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).commit()).to.be.reverted;
        });
        
        it("Should not commit if wallet tranfer fails", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;
            wallet.setTransferFrom(false);
            await expect(saleAgreement.connect(acc3).commit()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).commit()).to.be.reverted;
        });

        it("Should not commit if already commited", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).commit()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).commit()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).commit()).to.be.reverted;
        });

        it("Should commit and transfer assets", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            const commission = 10000 * 5 / 10000;

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).commit()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).commit())
                .to.emit(wallet, "Transfer").withArgs(acc3.address, saleAgreement.target, 9900)
                .to.emit(wallet, "Transfer").withArgs(saleAgreement.target, acc2.address, 10000 - commission)
                .to.emit(wallet, "Transfer").withArgs(saleAgreement.target, acc1.address, commission)
                .to.emit(ownership, "OwnershipTransfer").withArgs(saleAgreement.target, acc3.address, 3000);

            expect(await saleAgreement.status()).to.equal(2);
        });

    }); 

    describe("Withdraw", function () {

        it("Should not withdraw if already commited", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).commit()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).commit()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).withdraw(50)).to.be.reverted;
        });

        it("Should not withdraw if not consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc3).withdraw(50)).to.be.reverted;
        });

        it("Should withdraw and return assets", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).withdraw(50)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).withdraw(50))
                .to.emit(wallet, "Transfer").withArgs(saleAgreement.target, acc2.address, 50)
                .to.emit(wallet, "Transfer").withArgs(saleAgreement.target, acc3.address, 50)
                .to.emit(ownership, "OwnershipTransfer").withArgs(saleAgreement.target, acc2.address, 3000);

            expect(await saleAgreement.status()).to.equal(3);
        });
    }); 
});