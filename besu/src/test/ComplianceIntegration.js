const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');

const textEncoder = new TextEncoder();

describe("Compliance + SaleAgreement + Ownership Integration", function () {

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

    async function deployComplianceWithSaleFixture() {
        const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        
        const ADOCUMENT = await ethers.getContractFactory("ADocument");
        const aDocument = await ADOCUMENT.deploy(cns.target);

        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);

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
        await cns.setContractAddress("Wallet", wallet.target);

        const realtyDetails = {
            name: "foo",
            ownership: acc2.address,
            kind: "house",
            district: "lisbon",
            location: "central route",
            image: "image",
            totalArea: 100
        }
        await realtyFactory.connect(acc1).mint(realtyDetails, [acc2.address], [10000]);
        const ownershipAddr = await realtyFactory.registry(0);
        const ownership = new ethers.Contract(ownershipAddr, getAbi.ownershipAbi(), ethers.provider);

        const saleDetails = {
            buyer: acc3.address,
            seller: acc2.address,
            realty: ownership.target,
            share: 3000,
            price: 10000,
            earnest: 100,
            realtor: acc1.address,
            comission: 5,
            contengencyPeriod: 10000, 
            contengencyClauses: textEncoder.encode("foo")
        }

        const contract = await ethers.getContractFactory("SaleAgreement");
        const saleAgreement = await contract.deploy(cns.target, saleDetails);
        
        return { compliance, aDocument, realtyFactory, ownership, wallet, saleAgreement };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            const {  compliance, aDocument, bDocument, realtyFactory, ownershipAddr } = await loadFixture(deployComplianceFixture);
            const {  compliance2, aDocument2, realtyFactory2, ownership, wallet, saleAgreement } = await loadFixture(deployComplianceWithSaleFixture);
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

    describe("Integration w/ SaleAgreement", function () {

        it("Should consent if compliant", async function () {
            const {  compliance, aDocument, realtyFactory, ownership, wallet, saleAgreement } = await loadFixture(deployComplianceWithSaleFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(compliance.addDocumentation("house", "sale", aDocument.target)).not.to.be.reverted;
            await expect(aDocument.issueDocument(ownership.target, 50, 100)).not.to.be.reverted;

            expect(await saleAgreement.status()).to.equal(0);
            await expect(saleAgreement.connect(acc2).consent()).not.to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).not.to.be.reverted;
            expect(await saleAgreement.status()).to.equal(1);

        });

        it("Should not consent if not compliant", async function () {
            const {  compliance, aDocument, realtyFactory, ownership, wallet, saleAgreement } = await loadFixture(deployComplianceWithSaleFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc3.address, 10000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(saleAgreement.target, 10000)).not.to.be.reverted;
            await expect(ownership.connect(acc2).approve(saleAgreement.target)).not.to.be.reverted;

            await expect(compliance.addDocumentation("house", "sale", aDocument.target)).not.to.be.reverted;

            await expect(saleAgreement.connect(acc2).consent()).to.be.reverted;
            await expect(saleAgreement.connect(acc3).consent()).to.be.reverted;
            expect(await saleAgreement.status()).to.equal(0);
        });

    });



});