const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Ownership", function () {

  async function deployOwnershipFixture() {
    const [account1, account2, account3, account4] = await ethers.getSigners();
    const contract = await ethers.getContractFactory("Ownership");
    const ownership = await contract.deploy([account1.address, account2.address, account3.address], [4000, 3000, 3000]);

    return {ownership, account1, account2, account3, account4};
  }

  describe("Deployment", function () {
    it("Should set the right owners and shares", async function () {
        const { ownership, account1, account2, account3} = await loadFixture(deployOwnershipFixture);

        expect(await ownership.shareOf(account1.address)).to.equal(4000);
        expect(await ownership.shareOf(account2.address)).to.equal(3000);
        expect(await ownership.shareOf(account3.address)).to.equal(3000);

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

      await ownership.connect(account2).transferShares(account1.address, account2.address, 500);
      expect(await ownership.shareOf(account1.address)).to.equal(3500);
      expect(await ownership.shareOf(account2.address)).to.equal(3500);

    });

    it("Should transfer shares by external operator", async function () {
        const { ownership, account1, account2, account3, account4} = await loadFixture(deployOwnershipFixture);

        await ownership.connect(account1).approve(account4.address);
        expect(await ownership.approvedOf(account1.address)).to.equal(account4.address);

        await ownership.connect(account4).transferShares(account1.address, account2.address, 500);
        expect(await ownership.shareOf(account1.address)).to.equal(3500);
        expect(await ownership.shareOf(account2.address)).to.equal(3500);

    });

    it("Should not transfer shares", async function () {
      const { ownership, account1, account2, account3} = await loadFixture(deployOwnershipFixture);

      await ownership.connect(account1).approve(account2.address);
      expect(await ownership.approvedOf(account1.address)).to.equal(account2.address);

      await expect(ownership.connect(account3).transferShares(account1.address, account2.address, 500)).to.be.reverted;

    });
      
  });


});
