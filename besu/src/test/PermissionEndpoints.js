const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

describe("PermissionEndpoints", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployPermissionEndpointsFixture() {  
        const { cns } = await loadFixture(deployCNSFixture);

        const OrganizationRegistry = await ethers.getContractFactory("OrganizationRegistry");
        const organizationRegistry = await OrganizationRegistry.deploy(cns.target);

        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);

        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);

        const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
        const nodeRegistry = await NodeRegistry.deploy(cns.target);

        const PermissionEndpoints = await ethers.getContractFactory("PermissionEndpoints");
        const permissionEndpoints = await PermissionEndpoints.deploy(cns.target);

        await cns.setContractAddress("PermissionEndpoints", permissionEndpoints.target);
        await cns.setContractAddress("OrganizationRegistry", organizationRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("NodeRegistry", nodeRegistry.target);

        return {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry};
    }

    describe("Deployment", function () {

        it("Should deploy PermissionsEndpoints contract", async function () {
            const [acc1] = await ethers.getSigners();

            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);

            //await expect(roleRegistry.connect(acc1).addRole("admin_org1", "org1", true, 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        });
    });

    describe("Authorization", function () {

        it("Should not allow anyone to call previleged operations", async function () {   

        });




    });



});