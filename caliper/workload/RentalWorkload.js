const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

const textEncoder = new TextEncoder();
const emptyAddr = "0x0000000000000000000000000000000000000000"; 
const acc2 = "0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C";

const assetDetails = {
    name: "foo",
    ownership: emptyAddr,
    kind: "house",
    district: "lisbon",
    location: "central route",
    image: "image",
    totalArea: 100
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class RentalWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.txCounter = 0;
        this.clientAddr = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.clientAddr = sutContext.fromAddress;

        const request = [{
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [this.clientAddr, 900000000]
        }];

        await this.sutAdapter.sendRequests(request);
    }

    async submitTransaction() {
        let txid = this.txCounter++;
        console.log("NUMBER ", txid)

        const inputString = this.clientAddr + txid.toString();
        const hash = crypto.createHash('sha256').update(inputString).digest('hex');
        const derivedAddress = '0x' + hash.substring(0, 40);

        const rentalDetails = {
            realtyContract: derivedAddress,
            startDate: Math.floor(Date.now() / 1000),
            duration: 3, 
            rentValue: 200,
            securityDeposit: 100,
            securityReturnDueDate: 15,
            paymentDueDate: 1,
            latePaymentFee: 10,
            earlyTerminationFee: 50, 
            earlyTerminationNotice: 1,
            extra: 'extra terms', 
            payees: [acc2], 
            shares: [1]
        }

        let requestsSettings = [{
            contract: 'RentalAgreementFactory',
            verb: 'createRentalAgreement',
            value: 0,
            args: [this.clientAddr, rentalDetails]
        }];

        const res = await this.sutAdapter.sendRequests(requestsSettings);

        if(res[0].status.status === 'failed') {
            console.log("CREATION FAILED ", this.workerIndex, " : ", txid);
            return;
        }
        
        requestsSettings = [{
            contract: 'RentalAgreementFactory',
            verb: 'getRentalsOf',
            value: 0,
            args: [derivedAddress],
            readOnly: true
        }];

        const result = await this.sutAdapter.sendRequests(requestsSettings);
        const rentals = result[0].GetResult();
        const rentalAddr = rentals[rentals.length - 1];

        requestsSettings = [{
            contract: 'Wallet',
            verb: 'approve',
            value: 0,
            args: [rentalAddr, 900000],
        },
        {
            contract: 'RentalAgreement',
            verb: 'enroll',
            value: 0,
            args: [],
            address: rentalAddr
        },
        {
            contract: 'RentalAgreement',
            verb: 'reduceTerm',
            value: 0,
            args: [1],
            address: rentalAddr
        },
        {
            contract: 'RentalAgreement',
            verb: 'payRent',
            value: 0,
            args: [],
            address: rentalAddr
        },
        /*{
            contract: 'RentalAgreement',
            verb: 'returnDeposit',
            value: 0,
            args: [0],
            address: rentalAddr
        }*/];

        return this.sutAdapter.sendRequests(requestsSettings);
    }

}

function createWorkloadModule() {
    return new RentalWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;