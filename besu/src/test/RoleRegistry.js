const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

describe("RoleRegistry", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployRoleRegistryFixture() {  
        const [acc1] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);

        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);

        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        return {roleRegistry};
    }

    describe("Deployment", function () {

        it("Should deploy RoleRegistry contract", async function () {
            const [acc1] = await ethers.getSigners();

            const {roleRegistry} = await loadFixture(deployRoleRegistryFixture);

            await expect(roleRegistry.connect(acc1).addRole("admin", "org1", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        });
    });

    describe("addRole", function () {

        it("Should register new Role", async function () {
            const [acc1] = await ethers.getSigners();

            const {roleRegistry} = await loadFixture(deployRoleRegistryFixture);

            await expect(roleRegistry.connect(acc1).addRole("admin", "org1", 0, [0,2,3,5,6])).not.to.be.reverted;

            expect(await roleRegistry.roleExists("org1_admin")).to.be.true;
            expect(await roleRegistry.canCreateAccounts("org1_admin")).to.be.true;
            expect(await roleRegistry.canCreateRoles("org1_admin")).to.be.false;
            expect(await roleRegistry.canCreateNodes("org1_admin")).to.be.true;
            expect(await roleRegistry.canCreateContracts("org1_admin")).to.be.true;
            expect(await roleRegistry.canMintCurrency("org1_admin")).to.be.false;
            expect(await roleRegistry.canMintRealties("org1_admin")).to.be.true;
            expect(await roleRegistry.canDefinePolicies("org1_admin")).to.be.true;
            expect(await roleRegistry.canMintLoans("org1_admin")).to.be.false;
        });

        it("Should not register new Role if unauthorized", async function () {
            const [acc1, acc2] = await ethers.getSigners();

            const {roleRegistry} = await loadFixture(deployRoleRegistryFixture);

            await expect(roleRegistry.connect(acc2).addRole("admin", "org1", 0, [0,1,2,3,4,5,6,7])).to.be.reverted;
        });
    });


});