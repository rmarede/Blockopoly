const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/get-abi');
describe("Ownership", function () {

  async function deployOwnershipFixture() {
    const [admin, account1, account2, account3, account4] = await ethers.getSigners();
    const Ownership = await ethers.getContractFactory("Ownership");
    const ownership = await Ownership.deploy([account1.address, account2.address, account3.address], [40, 30, 30]);

    return {ownership, account1, account2, account3, account4};
  }

  describe("Deployment", function () {
    it("Should set the right owners and shares", async function () {
        const { ownership, account1, account2, account3} = await loadFixture(deployOwnershipFixture);

        expect(await ownership.shareOf(account1.address)).to.equal(40);
        expect(await ownership.shareOf(account2.address)).to.equal(30);
        expect(await ownership.shareOf(account3.address)).to.equal(30);

      });
  });

  describe("Transfer", function () {
    it("Should transfer shares to other owner", async function () {
        const { ownership, account1, account2} = await loadFixture(deployOwnershipFixture);

        await ownership.connect(account1).transferShares(account1.address, account2.address, 5);
        expect(await ownership.shareOf(account1.address)).to.equal(35);
        expect(await ownership.shareOf(account2.address)).to.equal(35);

      });

      it("Should not transfer shares of other", async function () {
        
        const { ownership, account1, account2} = await loadFixture(deployOwnershipFixture);

        await expect(ownership.connect(account2).transferShares(account1.address, account2.address, 5)).to.be.reverted;
      });

      it("Should not transfer shares that doesn't own", async function () {
        
        const { ownership, account1, account2} = await loadFixture(deployOwnershipFixture);

        await expect(ownership.connect(account1).transferShares(account1.address, account2.address, 50)).to.be.reverted;
      });
      
  });

  describe("Approve", function () {

    it("Should not approve", async function () {
      const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

      await expect(ownership.connect(account4).approve(account2.address)).to.be.reverted;
    });

    it("Should transfer shares by internal operator", async function () {
      const { ownership, account1, account2} = await loadFixture(deployOwnershipFixture);

      await ownership.connect(account1).approve(account2.address);
      expect(await ownership.approvedOf(account1.address)).to.equal(account2.address);

      await ownership.connect(account2).transferShares(account1.address, account2.address, 5);
      expect(await ownership.shareOf(account1.address)).to.equal(35);
      expect(await ownership.shareOf(account2.address)).to.equal(35);

    });

    it("Should transfer shares by external operator", async function () {
        const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

        await ownership.connect(account1).approve(account4.address);
        expect(await ownership.approvedOf(account1.address)).to.equal(account4.address);

        await ownership.connect(account4).transferShares(account1.address, account2.address, 5);
        expect(await ownership.shareOf(account1.address)).to.equal(35);
        expect(await ownership.shareOf(account2.address)).to.equal(35);

    });

    it("Should not transfer shares", async function () {
      const { ownership, account1, account2, account3} = await loadFixture(deployOwnershipFixture);

      await ownership.connect(account1).approve(account2.address);
      expect(await ownership.approvedOf(account1.address)).to.equal(account2.address);

      await expect(ownership.connect(account3).transferShares(account1.address, account2.address, 5)).to.be.reverted;

    });
      
  });

  describe("Submit", function () {

    it("Should not submit", async function () {
      const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

      let ownershipInterface = new ethers.Interface(getAbi.getOwnershipAbi());
      let destinationAddress = ownership.target;
      let functionToCall = 'changePolicy';
      let params = ["MAJORITY"];
      let data = ownershipInterface.encodeFunctionData(functionToCall, params);

      await expect(ownership.connect(account4).submitTransaction(destinationAddress, 0, data)).to.be.reverted;
    });

    it("Should submit", async function () {
      const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

      let ownershipInterface = new ethers.Interface(getAbi.getOwnershipAbi());
      let destinationAddress = ownership.target;
      let functionToCall = 'changePolicy';
      let params = ["MAJORITY"];
      let data = ownershipInterface.encodeFunctionData(functionToCall, params);

      await expect(ownership.connect(account1).submitTransaction(destinationAddress, 0, data)).not.to.be.reverted;

      expect(await ownership.transactionCount()).to.equal(1);
      let result = await ownership.transactions(0);
      expect(result[0]).to.equal(destinationAddress);
      expect(result[2]).to.equal(data);
      expect(result[3]).to.equal(false);
    }); 
  });

  describe("Confirm", function () {

    it("Should not confirm", async function () {
      const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

      let ownershipInterface = new ethers.Interface(getAbi.getOwnershipAbi());
      let destinationAddress = ownership.target;
      let functionToCall = 'changePolicy';
      let params = ["MAJORITY"];
      let data = ownershipInterface.encodeFunctionData(functionToCall, params);

      await ownership.connect(account1).submitTransaction(destinationAddress, 0, data);
      await expect(ownership.connect(account4).confirmTransaction(0)).to.be.reverted;
    });

    it("Should confirm and execute", async function () {
      const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);
      
      expect(await ownership.policy()).to.equal(0);

      await ownership.connect(account1).submitTransaction(ownership.target, 0, encodeOwnershipData('changePolicy', ['UNANIMOUS']));
      await expect(ownership.connect(account2).confirmTransaction(0)).not.to.be.reverted;
      let result = await ownership.transactions(0);
      expect(result[3]).to.equal(true);

      expect(await ownership.policy()).to.equal(1);
    }); 
  });


});

function encodeOwnershipData(functionToCall, params) {
  let ownershipInterface = new ethers.Interface(getAbi.getOwnershipAbi());
  let data = ownershipInterface.encodeFunctionData(functionToCall, params);
  return data;
}