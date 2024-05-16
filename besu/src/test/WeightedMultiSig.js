const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');


describe("WeightedMultiSig", function () {

    async function deployWeightedMultiSigFixture() {
        const [account1, account2, account3, account4] = await ethers.getSigners();
        const WeightedMultiSig = await ethers.getContractFactory("WeightedMultiSig");
        const weightedMultiSig = await WeightedMultiSig.deploy([account1.address, account2.address, account3.address], [4000, 3000, 3000], 0);
    
        return {weightedMultiSig, account1, account2, account3, account4};
    }

    describe("Deployment", function () {
        it("Should set the right participants and shares", async function () {
            const { weightedMultiSig, account1, account2, account3} = await loadFixture(deployWeightedMultiSigFixture);
            expect(await weightedMultiSig.shareOf(account1.address)).to.equal(4000);
            expect(await weightedMultiSig.shareOf(account2.address)).to.equal(3000);
            expect(await weightedMultiSig.shareOf(account3.address)).to.equal(3000);
        });
    });

    describe("Transfer", function () {
        it("Should transfer shares to other owner", async function () {
            const { weightedMultiSig, account1, account2} = await loadFixture(deployWeightedMultiSigFixture);
    
            await weightedMultiSig.connect(account1).transferShares(account1.address, account2.address, 500);
            expect(await weightedMultiSig.shareOf(account1.address)).to.equal(3500);
            expect(await weightedMultiSig.shareOf(account2.address)).to.equal(3500);
        });
    
        it("Should not transfer shares that doesn't own", async function () {
            const { weightedMultiSig, account1, account2} = await loadFixture(deployWeightedMultiSigFixture);
            await expect(weightedMultiSig.connect(account1).transferShares(account1.address, account2.address, 5000)).to.be.reverted;
        });
          
    });

    describe("Submit", function () {

        it("Should not submit transaction if does not participate", async function () {
            const { weightedMultiSig, account1, account2, account3, account4} = await loadFixture(deployWeightedMultiSigFixture);
            await expect(weightedMultiSig.connect(account4).submitTransaction(
                weightedMultiSig.target, 
                0, 
                abi.encodeWeightedMultiSigData('setMultisigPolicy', [1]))
            ).to.be.reverted;
        });
    
        it("Should submit transaction", async function () {
            const { weightedMultiSig, account1, account2, account3, account4} = await loadFixture(deployWeightedMultiSigFixture);
        
            await expect(weightedMultiSig.connect(account1).submitTransaction(
                weightedMultiSig.target, 
                0, 
                abi.encodeWeightedMultiSigData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;
        
            expect(await weightedMultiSig.transactionCount()).to.equal(1);
            let result = await weightedMultiSig.transactions(0);
            expect(result[0]).to.equal(weightedMultiSig.target);
            expect(result[2]).to.equal(abi.encodeWeightedMultiSigData('setMultisigPolicy', [1]));
            expect(result[3]).to.equal(false);
        }); 
    });
    
      describe("Confirm", function () {
    
        it("Should not confirm if does not participate", async function () {
            const { weightedMultiSig, account1, account2, account3, account4} = await loadFixture(deployWeightedMultiSigFixture);

            await expect(weightedMultiSig.connect(account1).submitTransaction(
                weightedMultiSig.target, 
                0, 
                abi.encodeWeightedMultiSigData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;

            expect(await weightedMultiSig.policy()).to.equal(0);
            await expect(weightedMultiSig.connect(account4).confirmTransaction(0)).to.be.reverted;
        });
    
        it("Should execute if majority confirmed", async function () {
            const { weightedMultiSig, account1, account2, account3, account4} = await loadFixture(deployWeightedMultiSigFixture);
            
            expect(await weightedMultiSig.policy()).to.equal(0);

            await expect(weightedMultiSig.connect(account1).submitTransaction(
                weightedMultiSig.target, 
                0, 
                abi.encodeWeightedMultiSigData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;
        
            await expect(weightedMultiSig.connect(account2).confirmTransaction(0)).not.to.be.reverted;
            let result = await weightedMultiSig.transactions(0);
            expect(result[3]).to.equal(true);
        
            expect(await weightedMultiSig.policy()).to.equal(1);
        }); 
      });


});
