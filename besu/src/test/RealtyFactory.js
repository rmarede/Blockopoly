const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

describe("RealtyFactory", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployRealtyFactoryFixture() {  
        const [acc1] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);  
        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const RealtyFactory = await ethers.getContractFactory("RealtyFactory", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realtyFactory = await RealtyFactory.deploy(cns.target);

        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);

        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);

        await cns.setContractAddress("RealtyFactory", realtyFactory.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        await expect(roleRegistry.connect(acc1).addRole("admin", "landregi", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.connect(acc1).addAccount(acc1.address, "landregi", "landregi_admin", true)).not.to.be.reverted; 

        return {realtyFactory, accountRegistry, roleRegistry};
    }

    describe("Deployment", function () {

        it("Should deploy RealtyFactory contract", async function () {
            const [acc1] = await ethers.getSigners();

            const {realtyFactory, accountRegistry, roleRegistry} = await loadFixture(deployRealtyFactoryFixture);

            expect(await accountRegistry.orgOf(acc1.address)).to.equal("landregi");
            expect(await accountRegistry.roleOf(acc1.address)).to.equal("landregi_admin");
            
            expect(await roleRegistry.canMintRealtyFactory("landregi_admin")).to.be.true;

        });
    });

    describe("Mint Asset", function () {
        it("Should mint asset's Ownership contract", async function () {
            const {realtyFactory} = await loadFixture(deployRealtyFactoryFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            const details = {
                name: "foo",
                ownership: acc1.address,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            await realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realtyFactory.registry(0);
            const asset = await realtyFactory.realtyFactory(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal(assetAddr);
            expect(asset[2]).to.equal("lisbon");

            const ownershipAbi = getAbi.ownershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            expect(await ownership.shareOf(acc1.address)).to.equal(4000);
            expect(await ownership.shareOf(acc2.address)).to.equal(3000);
            expect(await ownership.shareOf(acc3.address)).to.equal(3000);

            const realtyFactoryOf1 = await realtyFactory.getRealtiesOf(acc1.address);
            const realtyFactoryOf2 = await realtyFactory.getRealtiesOf(acc2.address);
            const realtyFactoryOf3 = await realtyFactory.getRealtiesOf(acc3.address);
            expect(realtyFactoryOf1[0]).to.equal(assetAddr);
            expect(realtyFactoryOf2[0]).to.equal(assetAddr);
            expect(realtyFactoryOf3[0]).to.equal(assetAddr);
        });

        it("Should not mint asset's Ownership contract", async function () {
            const {realtyFactory} = await loadFixture(deployRealtyFactoryFixture);

            const [acc1, acc2, acc3] = await ethers.getSigners();

            const details = {
                name: "foo",
                ownership: acc1.address,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            await expect(realtyFactory.connect(acc2).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000])).to.be.reverted;
            await expect(realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 3001])).to.be.reverted;
            await expect(realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 2999])).to.be.reverted;
            await expect(realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [5000, 5000, 0])).to.be.reverted;
            await expect(realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address], [4000, 3000, 3000])).to.be.reverted;
            await expect(realtyFactory.connect(acc1).mint(details, [], [])).to.be.reverted;
        });
    });

    describe("Add Ownership", function () {

        it("Should add ownership to new owner", async function () {
            const {realtyFactory} = await loadFixture(deployRealtyFactoryFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            const details = {
                name: "foo",
                ownership: acc1.address,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            await realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realtyFactory.registry(0);
            const asset = await realtyFactory.realtyFactory(assetAddr);

            expect(asset[0]).to.equal("foo");
            expect(asset[1]).to.equal(assetAddr);
            expect(asset[2]).to.equal("lisbon");

            const ownershipAbi = getAbi.ownershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc4.address, 2000)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(2000);
            expect(await ownership.shareOf(acc4.address)).to.equal(2000);

            const realtyFactoryOf1 = await realtyFactory.getRealtiesOf(acc1.address);
            const realtyFactoryOf4 = await realtyFactory.getRealtiesOf(acc4.address);

            expect(realtyFactoryOf1[0]).to.equal(assetAddr);
            expect(realtyFactoryOf4[0]).to.equal(assetAddr);
        });
    });

    describe("Remove Ownership", function () {

        it("Should remove ownership from previous owner", async function () {
            const {realtyFactory} = await loadFixture(deployRealtyFactoryFixture);

            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

            const details = {
                name: "foo",
                ownership: acc1.address,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            await realtyFactory.connect(acc1).mint(details, [acc1.address, acc2.address, acc3.address], [4000, 3000, 3000]);

            const assetAddr = await realtyFactory.registry(0);
            const asset = await realtyFactory.realtyFactory(assetAddr);

            const ownershipAbi = getAbi.ownershipAbi(); 
            const ownership = new ethers.Contract(assetAddr, ownershipAbi, ethers.provider);

            await expect(ownership.connect(acc1).transferShares(acc1.address, acc2.address, 4000)).not.to.be.reverted;

            expect(await ownership.shareOf(acc1.address)).to.equal(0);
            expect(await ownership.shareOf(acc2.address)).to.equal(7000);

            const realtyFactoryOf1 = await realtyFactory.getRealtiesOf(acc1.address);
            const realtyFactoryOf2 = await realtyFactory.getRealtiesOf(acc2.address);

            expect(realtyFactoryOf1).to.be.empty;
            expect(realtyFactoryOf2[0]).to.equal(assetAddr);

        });
    });

});