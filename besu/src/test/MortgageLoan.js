const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');
const timeHelper = require('../scripts/utils/time-helper');

  
describe("MortgageLoan", function () { 

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployMortgageLoanFixture() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("MockWallet");
        const wallet = await Wallet.deploy(cns.target);
        const Ownership = await ethers.getContractFactory("MockOwnership");
        const ownership = await Ownership.deploy([],[]);

        ownership.setMockShare(10000);
        
        await cns.setContractAddress("Wallet", wallet.target);

        const terms = {
            lender: acc1.address,
            borrower: acc2.address,
            principal: 500,
            downPayment: 100,  
            interestRate: 2, 
            loanTerm: 3, 
            startDate: await time.latest(),
            gracePeriod: 10, 
            latePaymentFee: 5, 
            defaultDeadline: 30
        };

        const contract = await ethers.getContractFactory("MortgageLoan");
        const mortgageLoan = await contract.deploy(cns.target, terms);
    
        return { mortgageLoan, wallet, ownership };
    }

    async function deployMortgageLoanFixturePermissioning() {
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
            startDate: timeHelper.toSolidityTime(Date.now()),
            gracePeriod: 1000, 
            latePaymentFee: 5, 
            defaultDeadline: timeHelper.toSolidityTime(Date.now()) + 100
        };

        const contract = await ethers.getContractFactory("MortgageLoan");
        const mortgageLoan = await contract.deploy(cns.target, terms);
    
        return { mortgageLoan, wallet };
    }

    describe("Deployment", function () {
        it("Should deploy MortgageLoan", async function () {
            const { mortgageLoan } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            const t = await mortgageLoan.details();
            expect(t.lender).to.equal(acc1.address);
            expect(t.borrower).to.equal(acc2.address);
        });
    });

    describe("Enroll", function () {
        it("Should enroll on MortgageLoan", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            expect(await mortgageLoan.status()).to.equal(0);
            await expect(mortgageLoan.connect(acc2).enroll())
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, mortgageLoan.target, 100);
            expect(await mortgageLoan.status()).to.equal(1);
        });

        it("Should not enroll if wallet transaction fails", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await wallet.setTransferFrom(false);
            await expect(mortgageLoan.connect(acc2).enroll()).to.be.reverted;
        });

        it("Should not enroll if already enrolled", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).enroll()).to.be.reverted;
        });

        it("Should not enroll if not borrower", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc1).enroll()).to.be.reverted;
            await expect(mortgageLoan.connect(acc3).enroll()).to.be.reverted;
        });
    });

    describe("Secure", function () {
        it("Should secure pending loan (enrolled)", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll())
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, mortgageLoan.target, 100);
            await expect(mortgageLoan.connect(acc1).secure())
                .to.emit(wallet, 'Transfer').withArgs(acc1.address, mortgageLoan.target, 500);

        });

        it("Should not secure if not enrolled", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc1).secure()).to.be.reverted;
        });

        it("Should not secure if not lender", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll())
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, mortgageLoan.target, 100);
            await expect(mortgageLoan.connect(acc2).secure()).to.be.reverted;
            await expect(mortgageLoan.connect(acc3).secure()).to.be.reverted;
        });

        it("Should not secure if wallet transaction fails", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll())
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, mortgageLoan.target, 100);

            await wallet.setTransferFrom(false);

            await expect(mortgageLoan.connect(acc1).secure()).to.be.reverted;
        });
    });

    describe("Submit Transaction", function () {
        it("Should submit and execute transaction immediately on pending loan", async function () {
            const { mortgageLoan, wallet, ownership } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc2.address, 100]))
            ).to.emit(wallet, 'Transfer').withArgs(mortgageLoan.target, acc2.address, 100);
        });

        it("Should submit but require confirm on active loan", async function () {
            const { mortgageLoan, wallet, ownership } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc1).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc2.address, 100]))
            ).not.to.emit(wallet, 'Transfer');

            await expect(mortgageLoan.connect(acc2).confirmTransaction(0))
                .to.emit(wallet, 'Transfer').withArgs(mortgageLoan.target, acc2.address, 100);
        });

        it("Should not submit if not borrower on pending loan", async function () {
            const { mortgageLoan, wallet, ownership } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc1).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc2.address, 100]))
            ).to.be.reverted

            await expect(mortgageLoan.connect(acc3).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc2.address, 100]))
            ).to.be.reverted
            
        });

        it("Should not submit if not borrower or lender on active loan", async function () {
            const { mortgageLoan, wallet, ownership } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc3).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc2.address, 100]))
            ).to.be.reverted
            
        });
    });

    describe("Amortize", function () {

        it("Should amortize active loan", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).amortize())
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, await mortgageLoan.amortization())
                .to.emit(mortgageLoan, 'LoanAmortized').withArgs(acc1.address, acc2.address);
        });

        it("Should amortize with leftovers", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await wallet.setBalanceOf(1);

            const amortization = await mortgageLoan.amortization();

            console.log("AMORTIZATION", amortization);

            await expect(mortgageLoan.connect(acc2).amortize())
                .to.emit(wallet, 'Transfer').withArgs(mortgageLoan.target, acc1.address, 1)
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, amortization - 1n)
                .to.emit(mortgageLoan, 'LoanAmortized').withArgs(acc1.address, acc2.address);
        });

        it("Should terminate when fully paid off", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize())
                .to.emit(mortgageLoan, 'LoanTerminated').withArgs(acc1.address, acc2.address);
            expect(await mortgageLoan.connect(acc2).status()).to.equal(3);
        });

        it("Should not amortize if already paid off", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc2).amortize()).to.be.reverted;
        });
    });

    describe("Foreclosure", function () {
        it("Should default if deadline is reached", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await time.increase(timeHelper.ethMonth());
            await expect(mortgageLoan.connect(acc1).foreclosure())
                .to.emit(mortgageLoan, 'LoanForeclosed').withArgs(acc1.address, acc2.address);

            expect(await mortgageLoan.connect(acc1).status()).to.equal(4);
        });

        it("Should not default if not tenant", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await time.increase(timeHelper.ethMonth());

            await expect(mortgageLoan.connect(acc2).foreclosure()).to.be.reverted
            await expect(mortgageLoan.connect(acc3).foreclosure()).to.be.reverted

        });

        it("Should not default if deadline is not reached", async function () {
            const { mortgageLoan, wallet } = await loadFixture(deployMortgageLoanFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(mortgageLoan.connect(acc2).enroll()).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).secure()).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc2).submitTransaction(
                wallet.target, 
                0, 
                abi.encodeWalletData('transfer', [acc3.address, 600]))
            ).not.to.be.reverted;
            await expect(mortgageLoan.connect(acc1).confirmTransaction(0)).not.to.be.reverted;

            await expect(mortgageLoan.connect(acc1).foreclosure()).to.be.reverted;
            await time.increase(29 * timeHelper.ethDay());
            await expect(mortgageLoan.connect(acc1).foreclosure()).to.be.reverted;
        });

    });



});