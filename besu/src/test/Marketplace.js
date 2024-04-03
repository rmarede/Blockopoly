const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const getAbi = require('../scripts/utils/abi');

describe("Marketplace", function () {

    async function deployCNSFixture() {
        const CNS = await ethers.getContractFactory("ContractNameService");
        const cns = await CNS.deploy([],[]);
        return { cns };
    }

    async function deployERC20Fixture() {
        const ERC20 = await ethers.getContractFactory("ERC20");
        const erc20 = await ERC20.deploy([],[]);
        return { erc20 };
    }

    async function deployMarketplaceFixture() {
        const { cns } = await loadFixture(deployCNSFixture);

        const Arrays = await ethers.getContractFactory("Arraysz");
        const arrays = await Arrays.deploy();

        const Realties = await ethers.getContractFactory("Realties", {
            libraries: {
                Arraysz: arrays.target
            }
        });
        const realties = await Realties.deploy(cns.target);

        const Marketplace = await ethers.getContractFactory("Marketplace");
        const marketplace = await Marketplace.deploy(cns.target);

        return {cns, marketplace, realties};
    }



    describe("Mint", function () {
        it("Should mint Ownership contract", async function () {
            const [acc1, acc2, acc3, acc4] = await ethers.getSigners();
            const {cns, marketplace, realties} = await loadFixture(deployMarketplaceFixture);

            await cns.setContractAddress("Realties", realties.target);
            await cns.setContractAddress("Marketplace", marketplace.target);

            await expect(realties.mint("foo", "faa", [acc1.address, acc2.address, acc3.address], [40, 30, 30])).not.to.be.reverted;

            



        });
    });

});