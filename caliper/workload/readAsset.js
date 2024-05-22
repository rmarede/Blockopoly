'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ReadAssetWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.assetAddr = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}`);

            const details = {
                name: "foo",
                ownership: acc1.address,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            const request = {
                contract: 'simple',
                verb: 'mint',
                value: 0,
                args: [details, [acc1.address], [10000]]
            };

            await this.sutAdapter.sendRequests(request);
        }
    }

    async submitTransaction() {
        let requestsSettings = [{
            contract: 'simple',
            verb: 'readAsset',
            value: 0,
            args: ['sfogliatella', 1000]
        },{
            contract: 'simple',
            verb: 'readAsset',
            value: 0,
            args: ['a-ababa', 900]
        }];
        
        await this.sutAdapter.sendRequests(requestsSettings);
    }

    async cleanupWorkloadModule() {
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
            const request = {
                contract: 'simple',
                verb: 'deleteAsset',
                value: 0,
                args: ['sfogliatella', 1000]
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new ReadAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;