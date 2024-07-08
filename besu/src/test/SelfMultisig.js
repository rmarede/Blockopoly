const {time, loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const abi = require('../scripts/utils/abi-data-encoder');


describe("SelfMultisig", function () {

    async function deploySelfMultisigFixture() {
        const [account1, account2, account3, account4] = await ethers.getSigners();
        const SelfMultisig = await ethers.getContractFactory("SelfMultisig");
        const selfMultisig = await SelfMultisig.deploy([account1.address, account2.address, account3.address], 0);
    
        return {selfMultisig, account1, account2, account3, account4};
    }

    describe("Deployment", function () {
        it("Should set the right participants and shares", async function () {
            const { selfMultisig, account1, account2, account3} = await loadFixture(deploySelfMultisigFixture);
            expect(await selfMultisig.participantExists(account1.address)).to.be.true;
            expect(await selfMultisig.participantExists(account2.address)).to.be.true;
            expect(await selfMultisig.participantExists(account3.address)).to.be.true;
        });
    });

    describe("Submit", function () {

        it("Should not submit transaction if does not participate", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
            await expect(selfMultisig.connect(account4).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).to.be.reverted;
        });
    
        it("Should submit transaction", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
        
            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).to.emit(selfMultisig, 'MultisigSubmission').withArgs(0, selfMultisig.target);
        
            expect(await selfMultisig.transactionCount()).to.equal(1);
            let result = await selfMultisig.transactions(0);
            expect(result[0]).to.equal(0);
            expect(result[1]).to.equal(0);
            expect(result[2]).to.equal(abi.encodeMultisignableData('setMultisigPolicy', [1]));
            expect(result[3]).to.equal(false);
        }); 
    });
    
    describe("Confirm", function () {
    
        it("Should not confirm if does not participate", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);

            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;

            expect(await selfMultisig.policy()).to.equal(0);
            await expect(selfMultisig.connect(account4).confirmTransaction(0)).to.be.reverted;
        });
    
        it("Should execute if majority confirmed", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
            
            expect(await selfMultisig.policy()).to.equal(0);

            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;
        
            await expect(selfMultisig.connect(account2).confirmTransaction(0))
                .to.emit(selfMultisig, 'MultisigTransaction').withArgs(0, selfMultisig.target);
            let result = await selfMultisig.transactions(0);
            expect(result[3]).to.equal(true);
        
            expect(await selfMultisig.policy()).to.equal(1);
        }); 

        it("Should not execute if not enough confirmations", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
            
            expect(await selfMultisig.policy()).to.equal(0);

            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).not.to.emit(selfMultisig, 'MultisigTransaction');
            expect(await selfMultisig.policy()).to.equal(0);
        }); 

        it("Should not confirm twice", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
            
            expect(await selfMultisig.policy()).to.equal(0);

            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).not.to.emit(selfMultisig, 'MultisigTransaction');
        
            await expect(selfMultisig.connect(account1).confirmTransaction(0)).to.be.reverted;
        }); 

        it("Should not confirm if already executed", async function () {
            const { selfMultisig, account1, account2, account3, account4} = await loadFixture(deploySelfMultisigFixture);
            
            expect(await selfMultisig.policy()).to.equal(0);

            await expect(selfMultisig.connect(account1).submitTransaction(
                0, 
                abi.encodeMultisignableData('setMultisigPolicy', [1]))
            ).not.to.be.reverted;
        
            await expect(selfMultisig.connect(account2).confirmTransaction(0))
                .to.emit(selfMultisig, 'MultisigTransaction').withArgs(0, selfMultisig.target);

            await expect(selfMultisig.connect(account2).confirmTransaction(0)).to.be.reverted;
                
        });
    });


});
