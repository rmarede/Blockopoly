const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const functionEncoder = require('../scripts/abi-data-encoder');

const textEncoder = new TextEncoder();
const emptyAddr = "0x0000000000000000000000000000000000000000"; 
const acc1 = "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73"; // TODO talvez de para acessar atraves do sutContext (vem do connector):
const acc2 = "0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C";

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

const assetDetails = {
    name: "foo",
    ownership: emptyAddr,
    district: "lisbon",
    postalCode: 2725455,
    street: "central route",
    number: 1,
    totalArea: 100
}

class ReadAssetWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.assetNr = 0;
        this.assets = undefined;
        this.txCounter = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Round arguments: ${JSON.stringify(roundArguments)}`);

        this.assetNr = roundArguments.assets;

        for (let i=0; i<this.assetNr; i++) {
            const request = {
                contract: 'RealtyFactory',
                verb: 'mint',
                value: 0,
                args: [assetDetails, [acc1], [10000]]
            };
            await this.sutAdapter.sendRequests(request);
        }
        
        const request = [{
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [acc1, 900000000]
        },{
            contract: 'RealtyFactory',
            verb: 'getRealtiesOf',
            value: 0,
            args: [acc1],
            readOnly: true
        }];

        const result = await this.sutAdapter.sendRequests(request);;
        this.assets = result[1].GetResult();
        console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Assets: ${this.assets}`);
    }

    async submitTransaction() {
        let txid = this.txCounter++;

        const assetAddr = this.assets[txid % this.assets.length];

        const saleDetails = {
            buyer: acc1,
            seller: acc1,
            realty: assetAddr,
            share: 3000,
            price: 1000,
            earnest: 100,
            realtor: acc2,
            comission: 500,
            contengencyPeriod: 10,
            contengencyClauses: textEncoder.encode("foo")
        }

        let requestsSettings = [{
            contract: 'SaleAgreementFactory',
            verb: 'createSaleAgreement',
            value: 0,
            args: [saleDetails]
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
        const saleAddr = result[0].GetResult()[2*txid];
        
        console.log(`$$$$$$$$$$$$$$$$$$$$$$$$$$ Sale Agreement ${txid} created at ${saleAddr} for asset ${assetAddr} $$$$$$$$$$$$$$$$$$$$$$$$$$`);


        requestsSettings = [{
            contract: 'Ownership',
            verb: 'approve',
            value: 0,
            args: [saleAddr],
            address: assetAddr
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
            address: saleAddr
        },
        {
            contract: 'SaleAgreement',
            verb: 'submitTransaction',
            value: 0,
            args: [0, functionEncoder.encodeSaleAgreementData('commit', [])],
            address: saleAddr
        }];

        await this.sutAdapter.sendRequests(requestsSettings);

        console.log(`+++++++++++++++++++++++++++++++++++ FINISHED TRANSACTION ${txid} +++++++++++++++++++++++++++++++++++`);
    }

}

function createWorkloadModule() {
    return new ReadAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;