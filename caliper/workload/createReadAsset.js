'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

const acc1 = "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73"; // TODO talvez de para acessar atraves do sutContext (vem do connector):
/*
let context = {
    chainId: 1,
    clientIndex: this.workerIndex,
    gasPrice: 0,
    contracts: {},
    nonces: {},
    web3: this.web3
};*/

// ou atraves do sutAdapter: connector usa isto this.ethereumConfig.fromAddress

class ReadAssetWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.assetAddr = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        /*for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}`);

            const details = {
                name: "foo",
                ownership: acc1,
                district: "lisbon",
                postalCode: 2725455,
                street: "central route",
                number: 1,
                totalArea: 100
            }

            const request = {
                contract: 'RealtyFactory',
                verb: 'mint',
                value: 0,
                args: [details, [acc1], [10000]]
            };

            await this.sutAdapter.sendRequests(request);
        }*/
    }

    async submitTransaction() {

        const details = {
            name: "foo",
            ownership: '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
            district: "lisbon",
            postalCode: 2725455,
            street: "central route",
            number: 1,
            totalArea: 100
        }

        let requestsSettings = [{
            contract: 'RealtyFactory',
            verb: 'mint',
            value: 0,
            args: [details, [acc1], [10000]]
        },
        {
            contract: 'RealtyFactory',
            verb: 'getRealtiesOf',
            value: 0,
            args: [acc1]
        }];
        
        await this.sutAdapter.sendRequests(requestsSettings);
    }

    async cleanupWorkloadModule() {
        /*for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
            const request = {
                contract: 'RealtyFactory',
                verb: 'deleteAsset',
                value: 0,
                args: ['sfogliatella', 1000]
            };

            await this.sutAdapter.sendRequests(request);
        }*/
    }
}

function createWorkloadModule() {
    return new ReadAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;