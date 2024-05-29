const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const functionEncoder = require('../scripts/abi-data-encoder');

const textEncoder = new TextEncoder();
const emptyAddr = "0x0000000000000000000000000000000000000000"; 
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
        this.txCounter = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Round arguments: ${JSON.stringify(roundArguments)}`);

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
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [acc1, 100000000]
        }];
        
        await this.sutAdapter.sendRequests(requestsSettings);

        requestsSettings = [{
            contract: 'RealtyFactory',
            verb: 'getRealtiesOf',
            value: 0,
            args: [acc1],
            readOnly: true
        }];

        // TODO com mais nos é capaz de ser preciso dar um sleep aqui
        const result = await this.sutAdapter.sendRequests(requestsSettings);;
        this.assetAddr = result[0].GetResult()[0];
    }

    async submitTransaction() {

        const details = {
            buyer: acc1,
            seller: acc1,
            realty: this.assetAddr,
            share: 3000,
            price: 1000,
            earnest: 100,
            realtor: acc1,
            comission: 0,
            contengencyPeriod: 10,
            contengencyClauses: textEncoder.encode("foo")
        }

        let requestsSettings = [{
            contract: 'SaleAgreementFactory',
            verb: 'createSaleAgreement',
            value: 0,
            args: [details]
        }];

        await this.sutAdapter.sendRequests(requestsSettings);
        
        requestsSettings = [{
            contract: 'SaleAgreementFactory',
            verb: 'getSalesOf',
            value: 0,
            args: [acc1],
            readOnly: true
        }];
        const result = await this.sutAdapter.sendRequests(requestsSettings);
        const saleAddr = result[0].GetResult()[this.txCounter++];
        
        console.log(`$$$$$$$$$$$$$$$$$$$$$$$$$$ Sale Agreement ${this.txCounter-1} created at ${saleAddr}`);


        requestsSettings = [{
            contract: 'Ownership',
            verb: 'approve',
            value: 0,
            args: [saleAddr],
            address: this.assetAddr
        },
        {
            contract: 'Wallet',
            verb: 'approve',
            value: 0,
            args: [saleAddr, 4000],
        },
        {
            contract: 'SaleAgreement',
            verb: 'submitTransaction',
            value: 0,
            args: [0, functionEncoder.encodeSaleAgreementData('consent', [])],
            address: this.assetAddr
        },
        {
            contract: 'SaleAgreement',
            verb: 'submitTransaction',
            value: 0,
            args: [0, functionEncoder.encodeSaleAgreementData('commit', [])],
            address: this.assetAddr
        }];

        await this.sutAdapter.sendRequests(requestsSettings);

        console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++++++11111111111111111111111111111111111`);
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