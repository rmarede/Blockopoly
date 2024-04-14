const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
describe("ContractNameService", function () {
  
    async function deployCNSFixture() {
      const CNS = await ethers.getContractFactory("ContractNameService");
      const cns = await CNS.deploy([],[]);
  
      return { cns };
    }

    describe("Set", function () {
        it("Should set the right addresses", async function () {
            const { cns } = await loadFixture(deployCNSFixture);
            await cns.setContractAddress("ADDRESS1", "0x0000000000000000000000000000000000007777");
            await cns.setContractAddress("ADDRESS2", "0x0000000000000000000000000000000000008888");
            expect(await cns.getContractAddress("ADDRESS1")).to.equal("0x0000000000000000000000000000000000007777");
            expect(await cns.getContractAddress("ADDRESS2")).to.equal("0x0000000000000000000000000000000000008888");
          });
    });

    describe("Update", function () {
        it("Should update versions", async function () {
            const { cns } = await loadFixture(deployCNSFixture);

            await cns.setContractAddress("ADDRESS1", "0x0000000000000000000000000000000000007777");
            await cns.setContractAddress("ADDRESS2", "0x0000000000000000000000000000000000008888");
            await cns.setContractAddress("ADDRESS1", "0x0000000000000000000000000000000000009999");
      
            expect(await cns.getContractAddress("ADDRESS1")).to.equal("0x0000000000000000000000000000000000009999");
            expect(await cns.getContractAddress("ADDRESS2")).to.equal("0x0000000000000000000000000000000000008888");
            
            expect(await cns.getContractVersion("ADDRESS1")).to.equal(2);
            expect(await cns.getContractVersion("ADDRESS2")).to.equal(1);

          });
    });
});