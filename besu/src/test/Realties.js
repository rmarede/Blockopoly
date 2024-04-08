const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

describe("Realties", function () {

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



    describe("Mint Asset", function () {
        it("Should mint asset's Ownership contract", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            await realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 30]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            expect(await ownership.shareOf(acc1.address)).to.equal(40);
            expect(await ownership.shareOf(acc2.address)).to.equal(30);
            expect(await ownership.shareOf(acc3.address)).to.equal(30);

            const realtiesOf1 = await realties.getRealtiesOf(acc1.address);
            const realtiesOf2 = await realties.getRealtiesOf(acc2.address);
            const realtiesOf3 = await realties.getRealtiesOf(acc3.address);
            expect(realtiesOf1[0]).to.equal(assetAddr);
            expect(realtiesOf2[0]).to.equal(assetAddr);
            expect(realtiesOf3[0]).to.equal(assetAddr);
        });

        it("Should not mint asset's Ownership contract", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 31])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 29])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [50, 50, 0])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [40, 30, 30])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [], [])).to.be.reverted;
        });
    });

    describe("Add Ownership", function () {

        it("Should add ownership to new owner", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            await realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 30]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc4.address, 20)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(20);
            expect(await ownership.shareOf(acc4.address)).to.equal(20);

            const realtiesOf1 = await realties.getRealtiesOf(acc1.address);
            const realtiesOf4 = await realties.getRealtiesOf(acc4.address);

            expect(realtiesOf1[0]).to.equal(assetAddr);
            expect(realtiesOf4[0]).to.equal(assetAddr);
        });
    });

    describe("Remove Ownership", function () {

        it("Should remove ownership from previous owner", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            await realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 30]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc2.address, 40)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(0);
            expect(await ownership.shareOf(acc2.address)).to.equal(70);

            const realtiesOf1 = await realties.getRealtiesOf(acc1.address);
            const realtiesOf2 = await realties.getRealtiesOf(acc2.address);

            expect(realtiesOf1).to.be.empty;
            expect(realtiesOf2[0]).to.equal(assetAddr);

        });
    });

});