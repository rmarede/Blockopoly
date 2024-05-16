const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');

describe("PermissionEndpoints", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    async function deployPermissionEndpointsFixture() {  
        const [orgVoter] = await ethers.getSigners();
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
        await cns.setContractAddress("OrganizationVoter", orgVoter.address);

        return {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry, cns};
    }

    describe("Deployment", function () {

        it("Should deploy PermissionsEndpoints contract", async function () {
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        });
    });

    describe("Authorization", function () {

        it("Should not allow anyone to call previleged operations except for OrganizationVoter address", async function () {   
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(acc1).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).to.be.reverted;
        });

    });

    describe("Organization Operations", function () {

        it("Should add organization along with admin role and admin account", async function () {
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);

            expect(await organizationRegistry.orgExists("org1")).to.be.false;
            expect(await roleRegistry.roleExists("org1_admin")).to.be.false;
            expect(await accountRegistry.accountExists(acc1.address)).to.be.false;

            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;

            expect(await organizationRegistry.orgExists("org1")).to.be.true;
            expect(await organizationRegistry.isActive("org1")).to.be.true;

            expect(await roleRegistry.roleExists("org1_admin")).to.be.true;
            expect(await roleRegistry.privilegeOf("org1_admin")).to.be.equal(0);
            
            expect(await accountRegistry.accountExists(acc1.address)).to.be.true;
            expect(await accountRegistry.isActive(acc1.address)).to.be.true;
            expect(await accountRegistry.isAdmin(acc1.address)).to.be.true;
            expect(await accountRegistry.roleOf(acc1.address)).to.be.equal("org1_admin");
            expect(await accountRegistry.orgOf(acc1.address)).to.be.equal("org1");
        });

        it("Should deactivate organization", async function () {
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            expect(await organizationRegistry.isActive("org1")).to.be.true;
            await expect(permissionEndpoints.connect(orgVoter).deactivateOrganization("org1")).not.to.be.reverted;
            expect(await organizationRegistry.isActive("org1")).to.be.false;
        });

    });

    describe("Role Operations", function () {	

        it("Should add role", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;

            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [])).not.to.be.reverted;
            expect(await accountRegistry.roleOf(acc1.address)).to.be.equal("org1_admin");
        });

        it("Should not add role of not existing organization", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);

            await expect(permissionEndpoints.connect(orgVoter).addRole("user", 1, [])).to.be.reverted;
        });

        it("Should not add role if has no permission", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,2,3,4,5,6,7])).not.to.be.reverted;

            expect(await roleRegistry.canCreateRoles("org1_admin")).to.be.false;
            expect(await accountRegistry.roleOf(acc1.address)).to.be.equal("org1_admin");

            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [])).to.be.reverted;
        });

        it("Should not add role with permissions that dont have", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6])).not.to.be.reverted;

            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [7])).to.be.reverted;
        });

        it("Should not add role with more privilege (lower privilege number)", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;

            await expect(permissionEndpoints.connect(acc1).addRole("privilege1", 1, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2, "org1_privilege1", true)).not.to.be.reverted;

            await expect(permissionEndpoints.connect(acc2).addRole("privilege0", 0, [0,1,2,3,4,5,6,7])).to.be.reverted;
        });

    });

    describe("Account Operations", function () {

        it("Should add account", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2.address, "org1_user", false)).not.to.be.reverted;
            expect(await accountRegistry.accountExists(acc2.address)).to.be.true;
            expect(await accountRegistry.roleOf(acc2.address)).to.be.equal("org1_user");
        });

        it("Should not add account for other organization", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org2", acc2.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc2).addAccount(acc3.address, "org1_user", false)).to.be.reverted;
        });

        it("Should not add account for not existing organization", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addAccount(acc1.address, "org1_user", false)).to.be.reverted;
        });

        it("Should not add account for not existing role", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2.address, "org1_user", false)).to.be.reverted;
        });

        it("Should not add account of role with higher privilege (lower privilege number)", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2.address, "org1_user", true)).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc2).addAccount(acc3.address, "org1_admin", false)).to.be.reverted;
        });
        
        it("Should not add account if has no permission", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2.address, "org1_user", false)).to.be.reverted;
        });

        it("Should not add admin if sender is not admin", async function () {
            const [orgVoter, acc1, acc2, acc3] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addRole("user", 1, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addAccount(acc2.address, "org1_user", false)).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc2).addAccount(acc3.address, "org1_user", true)).to.be.reverted;
        });
    });

    describe("Node Operations", function () {

        it("Should add node", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addNode("enodeid1", "192.158.1.38", 8080, 8081)).not.to.be.reverted;
            expect(await nodeRegistry.nodeExists("enodeid1")).to.be.true;
        });

        it("Should not add node for not existing organization", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addNode("enodeid1", "192.158.1.38", 8080, 8081)).to.be.reverted;
        });
        
        it("Should not add node if has no permission", async function () {
            const [orgVoter, acc1, acc2] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry} = await loadFixture(deployPermissionEndpointsFixture);
            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", acc1.address, [0,1,3,4,5,6,7])).not.to.be.reverted;
            await expect(permissionEndpoints.connect(acc1).addNode("enodeid1", "192.158.1.38", 8080, 8081)).to.be.reverted;
        });

    });

    describe("Integration with OrganizationVoter", function () {

        it("Should not execute operation AddOrganization", async function () {
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry, cns} = await loadFixture(deployPermissionEndpointsFixture);

            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", orgVoter.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;

            const OrganizationVoter = await ethers.getContractFactory("OrganizationVoter");
            const organizationVoter = await OrganizationVoter.deploy(cns.target, ["org1"], 1);
            await cns.setContractAddress("OrganizationVoter", organizationVoter.target);

            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org2", acc1.address, [0,1,2,3,4,5,6,7])).to.be.reverted;

            expect(await organizationRegistry.orgExists("org2")).to.be.false;
            expect(await roleRegistry.roleExists("org2_admin")).to.be.false;
            expect(await accountRegistry.accountExists(acc1.address)).to.be.false;
        });

        it("Should execute operation AddOrganization", async function () {
            const [orgVoter, acc1] = await ethers.getSigners();
            const {permissionEndpoints, organizationRegistry, roleRegistry, accountRegistry, nodeRegistry, cns} = await loadFixture(deployPermissionEndpointsFixture);

            await expect(permissionEndpoints.connect(orgVoter).addOrganization("org1", orgVoter.address, [0,1,2,3,4,5,6,7])).not.to.be.reverted;

            const OrganizationVoter = await ethers.getContractFactory("OrganizationVoter");
            const organizationVoter = await OrganizationVoter.deploy(cns.target, ["org1"], 1);
            await cns.setContractAddress("OrganizationVoter", organizationVoter.target);

            await expect(organizationVoter.connect(orgVoter).submitTransaction(
                permissionEndpoints.target, 
                0, 
                abi.encodePermissionEndpointsData('addOrganization', ["org2", acc1.address, [0,1,2,3,4,5,6,7]]))
            ).not.to.be.reverted;

            expect(await organizationRegistry.orgExists("org2")).to.be.true;
            expect(await roleRegistry.roleExists("org2_admin")).to.be.true;
            expect(await accountRegistry.accountExists(acc1.address)).to.be.true;

        });

    });

});