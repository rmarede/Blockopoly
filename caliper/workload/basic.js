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

class BasicWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.clientAddr = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        this.clientAddr = sutContext.fromAddress;

        const request = [{
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [this.clientAddr, 5]
        }];

        await this.sutAdapter.sendRequests(request);
    }

    async submitTransaction() {

        const request = [{
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [this.clientAddr, 5]
        }];

        await this.sutAdapter.sendRequests(request);

    }

}

function createWorkloadModule() {
    return new BasicWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;