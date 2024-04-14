const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');
const getAbi = require('../scripts/utils/get-abi');
  
describe("SaleAgreement", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployWalletFixture() {
        const contract = await ethers.getContractFactory("Wallet");
        const wallet = await contract.deploy();
        return { wallet };
    }

    async function deployRealtiesFixture() {    
        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const Realties = await ethers.getContractFactory("Realties", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realties = await Realties.deploy();
        return {realties};
    }

    async function deploySaleAgreementFixture() {
        const [acc1, acc2, acc3] = await ethers.getSigners();

        const { cns } = await loadFixture(deployCNSFixture);
        const { wallet } = await loadFixture(deployWalletFixture);
        const { realties } = await loadFixture(deployRealtiesFixture);

        await realties.mint("foo", "faa", [acc2.address], [10000]);

        const ownershipAbi = getAbi.getOwnershipAbi(); 
        const assetAddr = await realties.registry(0);
        const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

        cns.setContractAddress("Wallet", wallet.target);
        cns.setContractAddress("Realties", realties.target);

        const contract = await ethers.getContractFactory("SaleAgreement");
        // address _cns, address _realty, address _buyer, address _seller, uint _price, uint _share, address _realtor, uint _comission
        const saleAgreement = await contract.deploy(cns.target, ownership.target, acc3.address, acc2.address, 10000, 3000, acc1.address, 5);
        return {saleAgreement, wallet, ownership, realties};
    }

    describe("Deployment", function () {
        it("Should deploy SaleAgreement", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            expect(await saleAgreement.realty()).to.equal(ownership.target);
        });
    }); 

    describe("sign", function () {
        it("Should let buyer sign and hold funds", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).sign()).not.to.be.reverted;
            expect(await wallet.balanceOf(acc3.address)).to.equal(0);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(10000);
        });

        it("Should not let seller sign if buyer has not", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).sign()).to.be.reverted;
        });

        it("Should let seller sign if buyer has signed", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.connect(acc1).mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).sign()).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).sign()).not.to.be.reverted;
        });
    }); 

    describe("transfer", function () {
        it("Should transfer automatically when both parties signed", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.connect(acc1).mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).sign()).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).sign()).not.to.be.reverted;

            // price = 10000 (100$) , comission = 5 (0.05%) 

            expect(await wallet.balanceOf(acc3.address)).to.equal(0);
            expect(await wallet.balanceOf(acc1.address)).to.equal(5); // 10000 * 0.0005 (0.05%)
            expect(await wallet.balanceOf(acc2.address)).to.equal(9995);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(0);
            expect(await ownership.shareOf(acc2.address)).to.equal(7000);
            expect(await ownership.shareOf(acc3.address)).to.equal(3000);

        });
    });

    describe("widthdraw", function () {
        it("Should let seller widthdraw unsigned agreement", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.connect(acc1).mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).sign()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).widthdraw()).not.to.be.reverted;
            expect(await wallet.balanceOf(acc3.address)).to.equal(10000);
            expect(await wallet.balanceOf(saleAgreement.target)).to.equal(0);

            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).sign()).to.be.reverted;
        });

        it("Should not let widthdraw if already signed", async function () {
            const {saleAgreement, wallet, ownership} = await loadFixture(deploySaleAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.connect(acc1).mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).sign()).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;
            await expect(saleAgreement.connect(acc2).sign()).not.to.be.reverted;

            await expect(saleAgreement.connect(acc1).widthdraw()).to.be.reverted;
            await expect(saleAgreement.connect(acc2).widthdraw()).to.be.reverted;
        });
    });

});