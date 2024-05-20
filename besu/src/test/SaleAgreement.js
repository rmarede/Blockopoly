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
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();
        const Realties = await ethers.getContractFactory("Realties", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realties = await Realties.deploy(cns.target);

        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);

        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);

        await cns.setContractAddress("Wallet", wallet.target);
        await cns.setContractAddress("Realties", realties.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        const realty_details = {
            name: "foo",
            ownership: acc1.address, // placeholder, is replaced upon ownership creation
            district: "lisbon",
            postalCode: 2725455,
            street: "central route",
            number: 1,
            totalArea: 100
        }

        await expect(roleRegistry.connect(acc1).addRole("admin", "landregi", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.connect(acc1).addAccount(acc1.address, "landregi", "landregi_admin", true)).not.to.be.reverted; 
        await expect(realties.connect(acc1).mint(realty_details, [acc2.address], [10000])).not.to.be.reverted;

        const ownershipAbi = getAbi.ownershipAbi(); 
        const assetAddr = await realties.registry(0);
        const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

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
        return {saleAgreement, wallet, ownership, realties};
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
        
        it("Should not consent if not approved", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).to.be.reverted;
        });
        
        it("Should not consent after already consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            // testar para quando estado esta AGREED e COMMITED e WITHDRAWN

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(1)).to.be.reverted;
        });

        it("Should hold assets in escrow when both consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;

            expect(await saleAgreement.status()).to.equal(0);
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;
            expect(await saleAgreement.status()).to.equal(1);

            expect(await wallet.balanceOf(acc3.address)).to.equal(9900);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(100);
            expect(await ownership.shareOf(saleAgreement.target)).to.equal(3000);
        });
    }); 

    describe("Commit", function () {
        it("Should not commit if not yet consented by both parties", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).to.be.reverted;
        });
        
        it("Should not commit if no allowance", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 100)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(1)).to.be.reverted;
        });

        it("Should not commit if already commited", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(1)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(2)).to.be.reverted;  
        });

        it("Should commit and transfer assets", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(1)).not.to.be.reverted;

            expect(await saleAgreement.status()).to.equal(2);
            expect(await wallet.balanceOf(acc1.address)).to.equal(5);
            expect(await wallet.balanceOf(acc2.address)).to.equal(9995);
            expect(await wallet.balanceOf(acc3.address)).to.equal(0);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(0);
            expect(await ownership.shareOf(saleAgreement.target)).to.equal(0);
            expect(await ownership.shareOf(acc3.address)).to.equal(3000);
        });

    }); 

    describe("Withdraw", function () {

        it("Should not withdraw if already commited", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('commit', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(1)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('withdraw', [50]))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(2)).to.be.reverted;
        });

        it("Should not withdraw if not consented", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('withdraw', [50]))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(0)).to.be.reverted;
        });

        it("Should withdraw and return assets", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('consent', []))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).confirmTransaction(0)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc3).submitTransaction(
                0, 
                abi_encoder.encodeSaleAgreementData('withdraw', [50]))
            ).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).confirmTransaction(1)).not.to.be.reverted;

            expect(await saleAgreement.status()).to.equal(3);
            expect(await wallet.balanceOf(acc2.address)).to.equal(50);
            expect(await wallet.balanceOf(acc3.address)).to.equal(9950);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(0);
            expect(await ownership.shareOf(saleAgreement.target)).to.equal(0);
            expect(await ownership.shareOf(acc2.address)).to.equal(10000);
            expect(await ownership.shareOf(acc3.address)).to.equal(0);
        });
    }); 
});