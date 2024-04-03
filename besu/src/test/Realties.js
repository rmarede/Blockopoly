const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/abi');

describe("Realties", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployRealtiesFixture() {    
        const { cns } = await loadFixture(deployCNSFixture);

        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const Realties = await ethers.getContractFactory("Realties", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realties = await Realties.deploy(cns.target);
        return {realties};
    }



    describe("Mint Asset", function () {
        it("Should mint asset's Ownership contract", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3] = await ethers.getSigners();

            await realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 30]);

            const res = await realties.realties(0);

            expect(res[0]).to.equal("foo");
            expect(res[1]).to.equal("faa");

            const ownershipAbi = getAbi.getOwnershipAbi(); 
            const contract = new ethers.Contract(res[2], ownershipAbi, ethers.provider);

            expect(await contract.shareOf(acc1.address)).to.equal(40);
            expect(await contract.shareOf(acc2.address)).to.equal(30);
            expect(await contract.shareOf(acc3.address)).to.equal(30);
        });

        it("Should not mint asset's Ownership contract", async function () {
            const {realties} = await loadFixture(deployRealtiesFixture);

            const [acc1, acc2, acc3] = await ethers.getSigners();

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 31])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 29])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [50, 50, 0])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address], [40, 30, 30])).to.be.reverted;
            await expect(realties.mint("foo", "faa", [], [])).to.be.reverted;
        });
    });

});