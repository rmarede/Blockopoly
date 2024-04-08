const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/abi');
  
describe("RentalAgreement", function () {

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

    async function deployOwnershipFixture() {
        const [acc1] = await ethers.getSigners();
        const Ownership = await ethers.getContractFactory("Ownership");
        const ownership = await Ownership.deploy([acc1.address], [100]);
    
        return {ownership };
    }
  
    async function deployRentalAgreementFixturePresent() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const { wallet } = await loadFixture(deployWalletFixture);
        const { ownership } = await loadFixture(deployOwnershipFixture);
        
        await cns.setContractAddress("Wallet", wallet.target);

        const terms = {
            realtyContract: ownership.target,
            rentValue: 200,
            securityDeposit: 100,
            startDate: Math.floor(new Date().getTime() / 1000),
            duration: 3, 
            earlyTerminationFee: 50, 
            earlyTerminationNotice: 1,
            extra: 'extra terms', 
            payees: [acc1], 
            shares: [100]
        };

        const contract = await ethers.getContractFactory("RentalAgreement");
        const rentalAgreement = await contract.deploy(cns.target, acc2.address, terms);
    
        return { rentalAgreement, wallet, ownership };
    }

    async function deployRentalAgreementFixturePast() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const { wallet } = await loadFixture(deployWalletFixture);
        const { ownership } = await loadFixture(deployOwnershipFixture);
        
        await cns.setContractAddress("Wallet", wallet.target);

        const terms = {
            realtyContract: ownership.target,
            rentValue: 200,
            securityDeposit: 100,
            startDate: Math.floor(new Date().getTime() / 1000) - 60*60*24*30*12,
            duration: 3, 
            earlyTerminationFee: 50, 
            earlyTerminationNotice: 1,
            extra: 'extra terms', 
            payees: [acc1], 
            shares: [100]
        };

        const contract = await ethers.getContractFactory("RentalAgreement");
        const rentalAgreement = await contract.deploy(cns.target, acc2.address, terms);
    
        return { rentalAgreement, wallet, ownership };
    }

    describe("Deployment", function () {
        it("Should set the terms right", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();
            expect(await rentalAgreement.tenant()).to.equal(acc2.address);
            //console.log(await rentalAgreement.getTerms());
          });
    });

    describe("Pay", function () {
        it("Should pay the first and second months, but not third", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(400);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1600);
          });
    });

    describe("Terminate", function () {
        it("Should terminate only after paying every month", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePast);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, encodeRentalAgreementData('terminate', [5]))).to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, encodeRentalAgreementData('terminate', [5]))).not.to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(605);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1495);
          });
    });





});

function encodeRentalAgreementData(functionToCall, params) {
    let RentalAgreementInterface = new ethers.Interface(getAbi.getRentalAgreementAbi());
    let data = RentalAgreementInterface.encodeFunctionData(functionToCall, params);
    return data;
  }