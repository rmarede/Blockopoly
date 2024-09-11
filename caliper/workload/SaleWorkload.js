const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

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

class SaleWorkload extends WorkloadModuleBase {

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

        // For each worker, create the number of assets specified in the benchmark configuration (passed as parameter)
        // recommended to use a number of assets equal to the TPS

        for (let i=0; i<this.assetNr; i++) {
            const request = {
                contract: 'RealtyFactory',
                verb: 'mint',
                value: 0,
                args: [assetDetails, [this.clientAddr], [10000]]
            };
            this.sutAdapter.sendRequests(request);
        }

        await sleep(5000);
        
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

        const result = await this.sutAdapter.sendRequests(request);
        this.assets = result[1].GetResult();
        if (this.assets.length > this.assetNr) {
            this.assets = this.assets.slice(-this.assetNr);
        }

        await sleep(5000);

        for (let i=0; i<this.assets.length; i++) {
            const saleDetails = {
                buyer: this.clientAddr,
                seller: this.clientAddr,
                realty: this.assets[i],
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

            for (let j=0; j < 2; j++) {
                requestsSettings.push({
                    contract: 'SaleAgreementFactory',
                    verb: 'createSaleAgreement',
                    value: 0,
                    args: [saleDetails]
                });
            }

            await this.sutAdapter.sendRequests(requestsSettings);
        }
    }

    async submitTransaction() { 
        let txid = this.txCounter++;

        if (txid % 2 === 0) {
            const assetAddr = this.assets[(txid/2) % this.assets.length];

            const saleDetails = {
                buyer: this.clientAddr,
                seller: this.clientAddr,
                realty: assetAddr,
                share: 10,
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

        } else {
            const assetAddr = this.assets[(txid-1)/2 % this.assets.length];

            let requestsSettings = [{
                contract: 'SaleAgreementFactory',
                verb: 'getSalesOf',
                value: 0,
                args: [assetAddr],
                readOnly: true
            }];
    
            const result = await this.sutAdapter.sendRequests(requestsSettings);
            const saleAddr = result[0].GetResult()[Math.floor(Math.floor(txid / this.assets.length) / 2)]; // 0 1 2 3 4 5 6 7 8 9 ...
    
            console.log(assetAddr, " | SALE ADDRESS [", Math.floor(Math.floor(txid / this.assets.length) / 2), "] ON ", this.workerIndex, ":", txid, " -> ", saleAddr);
    
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
                verb: 'consent',
                value: 0,
                args: [],
                address: saleAddr
            },
            {
                contract: 'SaleAgreement',
                verb: 'commit',
                value: 0,
                args: [],
                address: saleAddr
            }];
    
            await this.sutAdapter.sendRequests(requestsSettings);
            
        }
    }

}

function createWorkloadModule() {
    return new SaleWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;