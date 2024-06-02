const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const functionEncoder = require('../scripts/abi-data-encoder');

const textEncoder = new TextEncoder();
const emptyAddr = "0x0000000000000000000000000000000000000000"; 
const acc2 = "0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C";

const assetDetails = {
    name: "foo",
    ownership: emptyAddr,
    district: "lisbon",
    postalCode: 2725455,
    street: "central route",
    number: 1,
    totalArea: 100
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class ReadAssetWorkload extends WorkloadModuleBase {

    constructor() {
        super();
        this.assetNr = 0;
        this.assets = undefined;
        this.txCounter = 0;
        this.clientAddr = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.assetNr = roundArguments.assets;
        this.clientAddr = sutContext.fromAddress;

        for (let i=0; i<this.assetNr; i++) {
            const request = {
                contract: 'RealtyFactory',
                verb: 'mint',
                value: 0,
                args: [assetDetails, [this.clientAddr], [10000]]
            };
            this.sutAdapter.sendRequests(request);
        }
        
        const request = [{
            contract: 'Wallet',
            verb: 'mint',
            value: 0,
            args: [this.clientAddr, 900000000]
        },{
            contract: 'RealtyFactory',
            verb: 'getRealtiesOf',
            value: 0,
            args: [this.clientAddr],
            readOnly: true
        }];

        await sleep(5000);

        const result = await this.sutAdapter.sendRequests(request);
        this.assets = result[1].GetResult();
        if (this.assets.length > this.assetNr) {
            this.assets = this.assets.slice(-this.assetNr);
        }
    }

    async submitTransaction() {
        let txid = (this.totalWorkers*this.txCounter++) + this.workerIndex;

        const assetAddr = this.assets[txid % this.assets.length];

        const saleDetails = {
            buyer: this.clientAddr,
            seller: this.clientAddr,
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
            args: [assetAddr],
            readOnly: true
        }];

        const result = await this.sutAdapter.sendRequests(requestsSettings);
        const saleAddr = result[0].GetResult()[Math.floor(txid / this.assetNr)];

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
    }

}

function createWorkloadModule() {
    return new ReadAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;