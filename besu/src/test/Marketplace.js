const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/abi');

describe("Marketplace", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployWalletFixture() {
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy();
        return { wallet };
    }

    async function deployMarketplaceFixture() {
        const { cns } = await loadFixture(deployCNSFixture);
        const { wallet } = await loadFixture(deployWalletFixture);

        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const Realties = await ethers.getContractFactory("Realties", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realties = await Realties.deploy();

        const Marketplace = await ethers.getContractFactory("Marketplace");
        const marketplace = await Marketplace.deploy(cns.target);
        
        await cns.setContractAddress("Wallet", wallet.target);
        await cns.setContractAddress("Realties", realties.target);
        await cns.setContractAddress("Marketplace", marketplace.target);

        return {cns, marketplace, realties, wallet};
    }



    describe("Post Sale", function () {
        it("Should post sale", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties} = await loadFixture(deployMarketplaceFixture);

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await expect(marketplace.connect(acc1).postSale(assetAddr, 35, 200)).not.to.be.reverted;

            const sale = await marketplace.sales(0);
            expect(sale[1]).to.equal(assetAddr);
            expect(await marketplace.activeSales(0)).to.equal(0);
        });

        it("Should not post sale", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties} = await loadFixture(deployMarketplaceFixture);

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(marketplace.connect(acc1).postSale(assetAddr, 35, 200)).to.be.reverted;
            await assetContract.connect(acc1).approve(marketplace.target);
            await expect(marketplace.connect(acc1).postSale(assetAddr, 55, 200)).to.be.reverted;
            await expect(marketplace.connect(acc3).postSale(assetAddr, 10, 200)).to.be.reverted;
        });

        it("Should not let 2 active sales of same asset", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties} = await loadFixture(deployMarketplaceFixture);

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await expect(marketplace.connect(acc1).postSale(assetAddr, 20, 200)).not.to.be.reverted;
            await expect(marketplace.connect(acc1).postSale(assetAddr, 15, 100)).to.be.reverted; // TODO bug : array out of bonds, quando se mete not.to.be.reverted
        });

        it("Should let 2 not active sales of same asset", async function () {

        });
    });

    describe("Bid", function () {

        it("Should bid", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await marketplace.connect(acc1).postSale(assetAddr, 35, 200);


            await expect(marketplace.connect(acc2).bid(0, 210)).not.to.be.reverted;
        });	

        it("Should not bid if not approved", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await marketplace.connect(acc1).postSale(assetAddr, 35, 200);


            await expect(marketplace.connect(acc2).bid(0, 210)).to.be.reverted;
        });	

        it("Should not bid with no sales", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);
            
            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;

            await expect(marketplace.connect(acc2).bid(0, 210)).to.be.reverted;
        });	

        it("Should not bid on closed sale", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;
            await expect(wallet.mint(acc3.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(marketplace.target, 220)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await marketplace.connect(acc1).postSale(assetAddr, 35, 200);

            await expect(marketplace.connect(acc2).bid(0, 210)).not.to.be.reverted;
            await expect(marketplace.connect(acc1).closeSale(0, 0)).not.to.be.reverted;

            await expect(marketplace.connect(acc3).bid(0, 220)).to.be.reverted;
        });	

        it("Should not bid on non existing sale", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;

            await expect(marketplace.connect(acc2).bid(3, 210)).to.be.reverted;
        });	

        it("Should not bid with no sales", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;

            await expect(marketplace.connect(acc2).bid(0, 210)).to.be.reverted;
        });	

    });

    describe("Close Sale", function () {

        it("Should transfer ownership", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties, wallet} = await loadFixture(deployMarketplaceFixture);

            await expect(wallet.mint(acc2.address, 210)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(marketplace.target, 210)).not.to.be.reverted;

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await marketplace.connect(acc1).postSale(assetAddr, 35, 200);

            await expect(marketplace.connect(acc2).bid(0, 210)).not.to.be.reverted;

            await expect(marketplace.connect(acc1).closeSale(0, 0)).not.to.be.reverted;



        });	

        it("Should not close sale with no bids", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {cns, marketplace, realties} = await loadFixture(deployMarketplaceFixture);

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [50, 50])).not.to.be.reverted;
            const assetAddr = await realties.registry(0);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const assetContract = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await assetContract.connect(acc1).approve(marketplace.target);
            await marketplace.connect(acc1).postSale(assetAddr, 35, 200);

            await expect(marketplace.connect(acc1).closeSale(0, 0)).to.be.reverted; 

        });	
    });

});