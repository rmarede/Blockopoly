const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');
const timeHelper = require('../scripts/utils/time-helper');
  
describe("RentalAgreement", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployOwnershipFixture() {
        const [acc1] = await ethers.getSigners();
        const Ownership = await ethers.getContractFactory("Ownership");
        const ownership = await Ownership.deploy([acc1.address], [10000]);
    
        return {ownership };
    }
  
    async function deployRentalAgreementFixturePresent() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        const { ownership } = await loadFixture(deployOwnershipFixture);
        
        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);
        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);
        
        await cns.setContractAddress("Wallet", wallet.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        await expect(roleRegistry.connect(acc1).addRole("admin", "bank", 0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.connect(acc1).addAccount(acc1.address, "bank", "bank_admin", true)).not.to.be.reverted; 

        const terms = {
            realtyContract: ownership.target,
            startDate: timeHelper.toSolidityTime(Date.now()),
            duration: 3, 
            rentValue: 200,
            securityDeposit: 100,
            securityReturnDueDate: 15,
            paymentDueDate: 1,
            latePaymentFee: 10,
            earlyTerminationFee: 50, 
            earlyTerminationNotice: 1,
            extra: 'extra terms', 
            payees: [acc1], 
            shares: [1]
        };

        const contract = await ethers.getContractFactory("RentalAgreement");
        const rentalAgreement = await contract.deploy(cns.target, acc2.address, terms);
    
        return { rentalAgreement, wallet, ownership };
    }

    async function deployRentalAgreementFixturePast() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        const { ownership } = await loadFixture(deployOwnershipFixture);
        
        const AccountRegistry = await ethers.getContractFactory("AccountRegistry");
        const accountRegistry = await AccountRegistry.deploy(cns.target);
        const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
        const roleRegistry = await RoleRegistry.deploy(cns.target);
        
        await cns.setContractAddress("Wallet", wallet.target);
        await cns.setContractAddress("AccountRegistry", accountRegistry.target);
        await cns.setContractAddress("RoleRegistry", roleRegistry.target);
        await cns.setContractAddress("PermissionEndpoints", acc1.address);

        await expect(roleRegistry.connect(acc1).addRole("admin", "bank",  0, [0,1,2,3,4,5,6,7])).not.to.be.reverted;
        await expect(accountRegistry.connect(acc1).addAccount(acc1.address, "bank", "bank_admin", true)).not.to.be.reverted; 

        const terms = {
            realtyContract: ownership.target,
            startDate: timeHelper.toSolidityTime(Date.now() - timeHelper.year()),
            duration: 3, 
            rentValue: 200,
            securityDeposit: 100,
            securityReturnDueDate: 15,
            paymentDueDate: 1,
            latePaymentFee: 10,
            earlyTerminationFee: 50, 
            earlyTerminationNotice: 1,
            extra: 'extra terms', 
            payees: [acc1], 
            shares: [1]
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

    describe("Enroll", function () {
        it("Should not enroll if not tenant", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.mint(acc3.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc3).enroll()).to.be.reverted;
        });

        it("Should not enroll if not enough allowance", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).to.be.reverted;
        });

        it("Should not enroll twice", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).to.be.reverted;
          });

        it("Should enroll", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
        });
    });

    describe("Pay", function () {
        it("Should not pay if not tenant", async function () {
        });

        it("Should not pay in advance", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(400);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1500);
          });

          it("Should not pay more than duration", async function () {
          });

          it("Should conclude after paying everything", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePast);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('terminate', [5]))).to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('terminate', [5]))).not.to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(605);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1495);
          });

          it("Should apply the late payment fee", async function () {
          });
    });

    describe("Terminate", function () {
        it("Should terminate only after paying every month", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePast);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('terminate', [5]))).to.be.reverted;
            await expect(rentalAgreement.connect(acc2).pay(200)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('terminate', [5]))).not.to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(605);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1495);
          });
    });

    describe("Evict", function () {
        it("Should dump when expired", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePast);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('dump', []))).not.to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(100);
            expect(await rentalAgreement.status()).to.equal(3);
          });

          it("Should not dump if not expired", async function () {
            const { rentalAgreement, wallet, ownership } = await loadFixture(deployRentalAgreementFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(ownership.connect(acc1).submitTransaction(rentalAgreement.target, 0, abi.encodeRentalAgreementData('dump', []))).to.be.reverted;
            expect(await rentalAgreement.status()).to.equal(0);
          });
    });

    describe("reduceTerm", function () {
    });



});
