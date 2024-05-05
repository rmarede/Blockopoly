const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');
  
describe("MortgageLoan", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployMortgageLoanFixturePresent() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        
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
            lender: acc1.address,
            borrower: acc2.address,
            principal: 500,
            downPayment: 100,  
            interestRate: 24, 
            loanTerm: 3, 
            startDate: Math.floor(new Date().getTime() / 1000),
            gracePeriod: 1000, 
            latePaymentFee: 5, 
            defaultDeadline: Math.floor(new Date().getTime() / 1000) + 100
        };

        const contract = await ethers.getContractFactory("MortgageLoan");
        const mortgageLoan = await contract.deploy(cns.target, terms);
    
        return { mortgageLoan, wallet };
    }

    describe("Deployment", function () {
        it("Should deploy MortgageLoan", async function () {
            const { mortgageLoan } = await loadFixture(deployMortgageLoanFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            const t = await mortgageLoan.details();
            expect(t.lender).to.equal(acc1.address);
            expect(t.borrower).to.equal(acc2.address);
        });
    });

    describe("Enroll", function () {
        it("Should initialize MortgageLoan", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc1.address, 500)).not.to.be.reverted;
            await expect(wallet.mint(acc2.address, 100)).not.to.be.reverted;

            await expect(wallet.connect(acc2).approve(mortgageLoan.target, 100)).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;

            expect(await wallet.balanceOf(mortgageLoan.target)).to.equal(100);
            expect(await wallet.balanceOf(acc2.address)).to.equal(0);
        });

        it("Should not enroll if not approved or has no balance", async function () {
        });

        it("Should not enroll if already enrolled", async function () {
        });
    });

    describe("Secure", function () {
        it("Should enroll in initialized MortgageLoan", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixturePresent);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc1.address, 500)).not.to.be.reverted;
            await expect(wallet.mint(acc2.address, 100)).not.to.be.reverted;
            await expect(wallet.connect(acc1).approve(mortgageLoan.target, 500)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(mortgageLoan.target, 100)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            expect(await wallet.balanceOf(mortgageLoan.target)).to.equal(600);
            expect(await wallet.balanceOf(acc1.address)).to.equal(0);
            expect(await wallet.balanceOf(acc2.address)).to.equal(0);
        });

        it("Should not secure if not enrolled", async function () {
        });

        it("Should not secure if not approved or has no balance", async function () {
        });
    });

    describe("Amortize", function () {

        it("Should amortize active loan", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixturePresent);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc1.address, 1000)).not.to.be.reverted;
            await expect(wallet.mint(acc2.address, 1000)).not.to.be.reverted;
            await expect(wallet.connect(acc1).approve(mortgageLoan.target, 500)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(mortgageLoan.target, 100)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;
            expect(await wallet.balanceOf(mortgageLoan.target)).to.equal(0);

            await expect(wallet.connect(acc2).approve(mortgageLoan.target, await mortgageLoan.amortization())).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
        });

        it("Should not amortize if already paid off", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixturePresent);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(wallet.mint(acc1.address, 1000)).not.to.be.reverted;
            await expect(wallet.mint(acc2.address, 1000)).not.to.be.reverted;
            await expect(wallet.connect(acc1).approve(mortgageLoan.target, 500)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(mortgageLoan.target, 100)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;
            expect(await wallet.balanceOf(mortgageLoan.target)).to.equal(0);

            await expect(wallet.connect(acc2).approve(mortgageLoan.target, 1000)).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).to.be.reverted;
        });
    });

    describe("terminate", function () {
        it("Should terminate paid off loan", async function () {
        });

        it("Should not terminate unpaid loan", async function () {
        });

    });

    describe("foreclosure", function () {
        it("Should default if deadline is reached", async function () {
        });

        it("Should not default if deadline is not reached", async function () {
        });

    });



});