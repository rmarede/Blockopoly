const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');


describe("PaymentSplitter", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployPaymentSplitterFixture() {
        const [acc1, acc2, acc3, acc4] = await ethers.getSigners();

        const { cns } = await loadFixture(deployCNSFixture);
        const Wallet = await ethers.getContractFactory("Wallet");
        const wallet = await Wallet.deploy(cns.target);
        
        const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
        const paymentSplitter = await PaymentSplitter.deploy([acc1.address, acc2.address, acc3.address], [2, 1, 1], cns.target);
        
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
    
        return {paymentSplitter, wallet };
    }

    describe("Deployment", function () {
        it("Should set the shares right", async function () {
            const { paymentSplitter, wallet } = await loadFixture(deployPaymentSplitterFixture);
            const [acc1, acc2, acc3] = await ethers.getSigners();
            expect(await paymentSplitter.sharesOf(acc1.address)).to.equal(2);
            expect(await paymentSplitter.sharesOf(acc2.address)).to.equal(1);
            expect(await paymentSplitter.sharesOf(acc3.address)).to.equal(1);
          });
    });

    describe("Pay", function () {

        it("Should divide the payment according to shares", async function () {
            const { paymentSplitter, wallet } = await loadFixture(deployPaymentSplitterFixture);
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            
            await expect(wallet.connect(acc1).mint(acc4.address, 1000)).not.to.be.reverted;
            await expect(wallet.connect(acc4).approve(paymentSplitter.target, 1000)).not.to.be.reverted;
            await expect(paymentSplitter.connect(acc4).payFrom(acc4.address, 1000)).not.to.be.reverted;
            expect(await wallet.balanceOf(paymentSplitter.target)).to.equal(0);
            expect(await wallet.balanceOf(acc1.address)).to.equal(500);
            expect(await wallet.balanceOf(acc2.address)).to.equal(250);
            expect(await wallet.balanceOf(acc3.address)).to.equal(250);
            expect(await wallet.balanceOf(acc4.address)).to.equal(0);
        });


    });

});
