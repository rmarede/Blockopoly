const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

describe("Realties", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployRealtiesFixture() {  
        const [acc1] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);  
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

        await cns.setContractAddress("Realties", realties.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        await expect(roleRegistry.connect(acc1).addRole("admin_bank", "bank", true, 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.connect(acc1).addAccount(acc1.address, "bank", "admin_bank")).not.to.be.reverted; 

        return {realties, accountRegistry, roleRegistry};
    }

    describe("Deployment", function () {

        it("Should deploy Realties contract", async function () {
            const [acc1] = await ethers.getSigners();

            const {realties, accountRegistry, roleRegistry} = await loadFixture(deployRealtiesFixture);

            expect(await accountRegistry.orgOf(acc1.address)).to.equal("bank");
            expect(await accountRegistry.roleOf(acc1.address)).to.equal("admin_bank");
            
            expect(await roleRegistry.canMintRealties("admin_bank")).to.be.true;

        });
    });

    describe("Mint Asset", function () {
        it("Should mint asset's Ownership contract", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            await realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            expect(await ownership.shareOf(acc1.address)).to.equal(4000);
            expect(await ownership.shareOf(acc2.address)).to.equal(3000);
            expect(await ownership.shareOf(acc3.address)).to.equal(3000);

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

            await expect(realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [4000, 3000, 3001])).to.be.reverted;
            await expect(realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [4000, 3000, 2999])).to.be.reverted;
            await expect(realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [5000, 5000, 0])).to.be.reverted;
            await expect(realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address], [4000, 3000, 3000])).to.be.reverted;
            await expect(realties.connect(acc1).mint("foo", "faa", [], [])).to.be.reverted;
        });
    });

    describe("Add Ownership", function () {

        it("Should add ownership to new owner", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            await realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc4.address, 2000)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(2000);
            expect(await ownership.shareOf(acc4.address)).to.equal(2000);

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

            await realties.connect(acc1).mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realties.registry(0);
            const asset = await realties.realties(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal("faa");
            expect(asset[2]).to.equal(assetAddr);

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc2.address, 4000)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(0);
            expect(await ownership.shareOf(acc2.address)).to.equal(7000);

            const realtiesOf1 = await realties.getRealtiesOf(acc1.address);
            const realtiesOf2 = await realties.getRealtiesOf(acc2.address);

            expect(realtiesOf1).to.be.empty;
            expect(realtiesOf2[0]).to.equal(assetAddr);

        });
    });

});