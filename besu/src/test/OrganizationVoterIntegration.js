const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');

describe("OrganizationVoter Integration", function () {

    async function deployCNSFixture() {
        const contract = await ethers.getContractFactory("ContractNameService");
        const cns = await contract.deploy([],[]);
        return { cns };
    }

    /**
     * Deploy the OrganizationVoter contract with the following setup:
     * - OrganizationRegistry with a two organizations "org1" and "org2"
     * - OrganizationVoter with only "org1" initially, and UNANIMOUS policy
     * - RoleRegistry with "admin_org1", "admin_org2" and "user_org2" roles
     * - AccountRegistry with three accounts: acc1 is admin of org1, acc2 is admin of org2, and acc3 is user of org1
     */
    async function deployOrganizationVoterFixture() {  
        const [acc1, acc2, acc3] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        const OrganizationRegistry = await ethers.getContractFactory("OrganizationRegistry");
        const organizationRegistry = await OrganizationRegistry.deploy(cns.target);
        await cns.setContractAddress("OrganizationRegistry", organizationRegistry.target);

        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);

        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);

        await expect(organizationRegistry.addOrg("org1")).not.to.be.reverted;
        await expect(roleRegistry.addRole("admin", "org1", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(roleRegistry.addRole("user", "org1", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.addAccount(acc1.address, "org1", "org1_admin", true)).not.to.be.reverted;
        await expect(accountRegistry.addAccount(acc3.address, "org1", "org1_user", false)).not.to.be.reverted;

        await expect(organizationRegistry.addOrg("org2")).not.to.be.reverted;
        await expect(roleRegistry.addRole("admin", "org2", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.addAccount(acc2.address, "org2", "org2_admin", true)).not.to.be.reverted;

        const OrganizationVoter = await ethers.getContractFactory("OrganizationVoter");
        const organizationVoter = await OrganizationVoter.deploy(cns.target, ["org1"], 1);
        await cns.setContractAddress("OrganizationVoter", organizationVoter.target);

        return {organizationVoter, organizationRegistry, roleRegistry, accountRegistry};
    }

    describe("Deployment", function () {

        it("Should deploy OrganizationVoter contract", async function () {
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);

            expect(await organizationVoter.participantExists("org1")).to.be.true;
            expect(await organizationVoter.participantExists("org2")).to.be.false;
        });
    });

    describe("SubmitTransaction", function () {

        it("Should not submit if is not from participating organization", async function () {  
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc2).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).to.be.reverted;
        });

        it("Should not submit if is not admin of participating organization", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc3).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).to.be.reverted; 
        });

        it("Should submit if is admin of participating organization", async function () {   
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;
        });

    });

    
    describe("AddParticipant", function () {

        it("Should not be invoked by anyone except itself", async function () {   
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).addParticipant("org2")).to.be.reverted;
        });

        it("Should be invoked if transaction is confirmed", async function () {
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            expect(await organizationVoter.participantExists("org1")).to.be.true;
            expect(await organizationVoter.participantExists("org2")).to.be.true;
        });

        it("Should not add participant if already exists", async function () {   
            const [acc1, acc2, acc3] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc2).confirmTransaction(1)).to.be.reverted;
        });

    });

    describe("ConfirmTransaction", function () {

        it("Should confirm, but not execute", async function () {   
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc2).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('removeParticipant', ["org2"]))
            ).not.to.be.reverted;

            expect(await organizationVoter.getConfirmationCount(1)).to.be.equal(1);
            expect(await organizationVoter.participantExists("org1")).to.be.true;
            expect(await organizationVoter.participantExists("org2")).to.be.true;
        });

        it("Should confirm and execute", async function () {   
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc2).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('removeParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc1).confirmTransaction(1)).not.to.be.reverted;

            expect(await organizationVoter.participantExists("org1")).to.be.true;
            expect(await organizationVoter.participantExists("org2")).to.be.false;
        });

        it("Should not confirm if is not from participating organization", async function () {   
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc2).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('removeParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc4).confirmTransaction(1)).to.be.reverted;
        });

        it("Should not confirm if is not admin of participating organization", async function () {   
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            const {organizationVoter, organizationRegistry, roleRegistry, accountRegistry} = await loadFixture(deployOrganizationVoterFixture);
            
            await expect(organizationVoter.connect(acc1).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('addParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc2).submitTransaction(
                organizationVoter.target, 
                0, 
                abi.encodeOrganizationVoterData('removeParticipant', ["org2"]))
            ).not.to.be.reverted;

            await expect(organizationVoter.connect(acc3).confirmTransaction(1)).to.be.reverted;
        });

    });

});