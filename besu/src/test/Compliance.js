const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');

const REALTY1 = 

describe("Compliance", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
    
        return { cns };
    }

    async function deployComplianceFixture() {
        const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        
        const ADOCUMENT = await ethers.getContractFactory("ADocument");
        const aDocument = await ADOCUMENT.deploy(cns.target);
        const bDocument = await ADOCUMENT.deploy(cns.target);

        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const RealtyFactory = await ethers.getContractFactory("RealtyFactory", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realtyFactory = await RealtyFactory.deploy(cns.target);

        const COMPLIANCE = await ethers.getContractFactory("Compliance");
        const compliance = await COMPLIANCE.deploy(cns.target);

        await cns.setContractAddress("RealtyFactory", realtyFactory.target);
        await cns.setContractAddress("Compliance", compliance.target);

        const details = {
            name: "foo",
            ownership: acc1.address,
            kind: "house",
            district: "lisbon",
            location: "central route",
            image: "image",
            totalArea: 100
        }
        await realtyFactory.connect(acc1).mint(details, [acc1.address], [10000]);
        const ownershipAddr = await realtyFactory.registry(0);
        
        return { compliance, aDocument, bDocument, realtyFactory, ownershipAddr };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
          });
    });

    describe("AddDocumentation", function () {
        it("Should add documentation for property kind", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            expect(await compliance.documentation("house", "sale")).lengthOf(0);
            await expect(compliance.addDocumentation("house", "sale", aDocument.target)).not.to.be.reverted;
            expect(await compliance.documentation("house", "sale")).to.include(aDocument.target);
            expect(await compliance.documentation("apartment", "sale")).lengthOf(0);
            expect(await compliance.documentation("house", "rental")).lengthOf(0);
          });
    });

    describe("IsCompliant", function () {
        it("Should be compliant if no required documents", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            expect(await compliance.isCompliant(ownershipAddr, "sale")).to.be.true;
        });

        it("Should not be compliant if required document is not issued", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(compliance.addDocumentation("house", "sale", aDocument.target)).not.to.be.reverted;
            expect(await compliance.isCompliant(ownershipAddr, "sale")).to.be.false;
            await expect(aDocument.issueDocument(ownershipAddr, 50, 100)).not.to.be.reverted;
            await expect(compliance.addDocumentation("house", "sale", bDocument.target)).not.to.be.reverted;
            expect(await compliance.isCompliant(ownershipAddr, "sale")).to.be.false;
        });

        it("Should be compliant if all required documents are issued", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(compliance.addDocumentation("house", "sale", aDocument.target)).not.to.be.reverted;
            await expect(compliance.addDocumentation("house", "sale", bDocument.target)).not.to.be.reverted;
            await expect(aDocument.issueDocument(ownershipAddr, 50, 100)).not.to.be.reverted;
            await expect(bDocument.issueDocument(ownershipAddr, 50, 100)).not.to.be.reverted;
            expect(await compliance.isCompliant(ownershipAddr, "sale")).to.be.true;
        });
    });



});