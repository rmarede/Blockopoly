const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');
const timeHelper = require('../scripts/utils/time-helper');
  
describe("RentalAgreement + Wallet Integration", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }
  
    async function deployRentalAgreementFixture() {
        const [acc1, acc2] = await ethers.getSigners();
        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        
        await cns.setContractAddress("Wallet", wallet.target);

        const terms = {
            realtyContract: acc1.address,
            startDate: timeHelper.ethNow(),
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
    
        return { rentalAgreement, wallet };
    }

    async function deployRentalAgreementFixturePermissions() {
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
            realtyContract: acc1.address,
            startDate: timeHelper.ethNow(),
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
    
        return { rentalAgreement, wallet };
    }

    describe("Deployment", function () {
        it("Should set the terms right", async function () {
            const { rentalAgreement, wallet } = await loadFixture((deployRentalAgreementFixture));
            const [acc1, acc2] = await ethers.getSigners();
            expect(await rentalAgreement.tenant()).to.equal(acc2.address);
          });
    });

    describe("Enroll", function () {
        it("Should not enroll if not tenant", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            
            await expect(wallet.mint(acc3.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc3).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc3).enroll()).to.be.reverted;
        });

        it("Should not enroll if not enough allowance", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 100)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).to.be.reverted;
        });

        it("Should not enroll twice", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).to.be.reverted;
          });

        it("Should enroll, transfering first month rent and holding security deposit in escrow", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();
            
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll())
                .to.emit(rentalAgreement, 'RentalEnrolled').withArgs(acc2.address, acc1.address, rentalAgreement.target)
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, rentalAgreement.target, 100)
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            expect(await wallet.balanceOf(rentalAgreement.target)).to.equal(100);
            expect(await wallet.balanceOf(acc1.address)).to.equal(200);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1700);
        });
    });

    describe("Pay", function () {
        it("Should not pay if not tenant", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc1.address, 2000)).not.to.be.reverted;
            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc1).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc1).payRent()).to.be.reverted;
        });

        it("Should not pay in advance", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await expect(rentalAgreement.connect(acc2).payRent()).to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(400);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1500);
          });

          it("Should not pay more than duration", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + 2 * timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(600);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1300);
          });

          it("Should conclude after paying everything", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent())
                .to.emit(rentalAgreement, 'RentalComplete').withArgs(acc2.address, acc1.address, acc1.address)
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            expect(await rentalAgreement.status()).to.equal(2);
            expect(await wallet.balanceOf(acc1.address)).to.equal(600);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1300);
            expect(await wallet.balanceOf(rentalAgreement.target)).to.equal(100);
          });

          it("Should apply the late payment fee", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth() + 2*timeHelper.ethDay());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 210);
            expect(await wallet.balanceOf(acc1.address)).to.equal(410);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1490);
            expect(await wallet.balanceOf(rentalAgreement.target)).to.equal(100);
          });
    });

    describe("Return Deposit", function () {
        it("Should not return if not complete", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc1).returnDeposit(0)).to.be.reverted;
        });

        it("Should return if complete", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);

            await expect(rentalAgreement.connect(acc1).returnDeposit(0)).not.to.be.reverted;

            expect(await wallet.balanceOf(acc1.address)).to.equal(600);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1400);
            expect(await wallet.balanceOf(rentalAgreement.target)).to.equal(0);
        });

        it("Should apply penalty", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            
            await expect(rentalAgreement.connect(acc1).returnDeposit(10))
                .to.emit(wallet, 'Transfer').withArgs(rentalAgreement.target, acc1.address, 10)
                .to.emit(wallet, 'Transfer').withArgs(rentalAgreement.target, acc2.address, 90);
            expect(await wallet.balanceOf(acc1.address)).to.equal(610);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1390);
        });

        it("Should not let tenant return within return period", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);

            await expect(rentalAgreement.connect(acc2).returnDeposit(0)).to.be.reverted;
        });

        it("Should let tenant return after return period", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + 3*timeHelper.ethMonth() + 15*timeHelper.ethDay());
            await expect(rentalAgreement.connect(acc2).returnDeposit(0)).not.to.be.reverted;
            expect(await wallet.balanceOf(acc1.address)).to.equal(600);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1400);
        });
    });

    describe("Renew Term", function () {
        it("Should only renew if consent by both parties", async function () {
            const { rentalAgreement, wallet } = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);

            await expect(rentalAgreement.connect(acc1).renewTerm(3)).not.to.be.reverted;
            let terms = await rentalAgreement.terms();
            expect(terms[2]).to.equal(3n);
            await expect(rentalAgreement.connect(acc2).renewTerm(3))
                .to.emit(rentalAgreement, 'TermRenewed').withArgs(acc2.address, acc1.address, acc1.address);
            terms = await rentalAgreement.terms();
            expect(terms[2]).to.equal(6n);
        });

        it("Should not renew if already terminated", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await expect(rentalAgreement.connect(acc1).returnDeposit(0)).not.to.be.reverted;

            await expect(rentalAgreement.connect(acc1).renewTerm(3)).to.be.reverted;
        });
    });

    describe("Reduce Term", function () {
        it("Should not reduce if does not respect notice", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await expect(rentalAgreement.connect(acc2).reduceTerm(1)).to.be.reverted;
            const terms = await rentalAgreement.terms();
            expect(terms[2]).to.equal(3n);
        });

        it("Should reduce and apply fee", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).reduceTerm(1))
                .to.emit(rentalAgreement, 'TermReduced').withArgs(acc2.address, acc1.address, acc1.address)
                .to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 50);
            const terms = await rentalAgreement.terms();
            expect(terms[2]).to.equal(2n);
            expect(await wallet.balanceOf(acc1.address)).to.equal(250);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1650);
        });
    });

    describe("Terminate", function () {
          it("Should terminate only if consent by both parties", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc1).terminate()).not.to.be.reverted;
            expect(await rentalAgreement.status()).to.equal(1);
            await expect(rentalAgreement.connect(acc2).terminate())
                .to.emit(rentalAgreement, 'RentalComplete').withArgs(acc2.address, acc1.address, acc1.address);
            expect(await rentalAgreement.status()).to.equal(2);
          });

          it("Should not terminate if complete, not enrolled, or security returned", async function ()  {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(rentalAgreement.connect(acc1).terminate()).to.be.reverted;

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);
            await time.increaseTo(timeHelper.ethNow() + timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc2).payRent()).to.emit(wallet, 'Transfer').withArgs(acc2.address, acc1.address, 200);

            await expect(rentalAgreement.connect(acc1).terminate()).to.be.reverted;

            await expect(rentalAgreement.connect(acc1).returnDeposit(0)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc1).terminate()).to.be.reverted;

          });
    });

    describe("Evict", function () {
        it("Should evict when expired", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await time.increaseTo(timeHelper.ethNow() + 6*timeHelper.ethMonth());
            await expect(rentalAgreement.connect(acc1).evict())
                .to.emit(rentalAgreement, 'RentalComplete').withArgs(acc2.address, acc1.address, acc1.address);
            expect(await rentalAgreement.status()).to.equal(3);
            expect(await wallet.balanceOf(acc1.address)).to.equal(300);
            expect(await wallet.balanceOf(acc2.address)).to.equal(1700);
          });

          it("Should not evict if not expired", async function () {
            const { rentalAgreement, wallet} = await loadFixture(deployRentalAgreementFixture);
            const [acc1, acc2] = await ethers.getSigners();

            await expect(wallet.mint(acc2.address, 2000)).not.to.be.reverted;
            await expect(wallet.connect(acc2).approve(rentalAgreement.target, 2000)).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc2).enroll()).not.to.be.reverted;
            await expect(rentalAgreement.connect(acc1).evict()).to.be.reverted;
          });
    });
});
