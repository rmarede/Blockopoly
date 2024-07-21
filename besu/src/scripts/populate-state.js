const ethers = require('ethers');
const getAbi = require('./utils/get-abi');
const abiEncoder = require('./utils/abi-data-encoder');
const getAddress = require('./utils/get-address');
const timeHelper = require('./utils/time-helper');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const textEncoder = new TextEncoder();

const PUBLIC_KEY_1 = '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73';
const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PUBLIC_KEY_2 = '0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C';
const PRIVATE_KEY_2 = '0x6c6fd860efa48e8f07e85482f06ddb6a989ac962dcb13f8d30fa85c104a0219b';
const PUBLIC_KEY_3 = '0xC195057Fdd4eF1BB3022f5F1157D30b6468c84c8';
const PRIVATE_KEY_3 = '0x5d13d769309b9ab2de1cf46b1cb1f76ddea3702d285eb7deb77de225ac118240';
const PUBLIC_KEY_4 = '0xB0263c245533d3Eb188F6F6C57DF48C3B3f39631';
const PRIVATE_KEY_4 = '0x9d5876523ecdf5723f447f8049ff1492fdf83f1c0edd5770b4805fcfc67bd14d';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet1 = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer1 = wallet1.connect(provider);
const wallet2 = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer2 = wallet2.connect(provider);
const wallet3 = new ethers.Wallet(PRIVATE_KEY_3, provider);
const signer3 = wallet3.connect(provider);
const wallet4 = new ethers.Wallet(PRIVATE_KEY_4, provider);
const signer4 = wallet4.connect(provider);

const Wallet = new ethers.Contract(getAddress.walletAddress(), getAbi.walletAbi(), provider);
const RealtyFactory = new ethers.Contract(getAddress.realtyFactoryAddress(), getAbi.realtyFactoryAbi(), provider);
const RentalAgreementFactory = new ethers.Contract(getAddress.rentalFactoryAddress(), getAbi.rentalFactoryAbi(), provider);
const SaleAgreementFactory = new ethers.Contract(getAddress.saleFactoryAddress(), getAbi.saleFactoryAbi(), provider);
const MortgageLoanFactory = new ethers.Contract(getAddress.mortgageFactoryAddress(), getAbi.mortgageFactoryAbi(), provider);
const Compliance = new ethers.Contract(getAddress.complianceAddress(), getAbi.complianceAbi(), provider);
const ADocument = new ethers.Contract(getAddress.aDocumentAddress(), getAbi.aDocumentAbi(), provider);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to set the permissioning state? (y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
        const PermissionEndpoints = new ethers.Contract(getAddress.permissionEndpointsAddress(), getAbi.permissionEndpointsAbi(), provider);
        console.log("Adding organizations...")
        await PermissionEndpoints.connect(signer1).addOrganization("gov", PUBLIC_KEY_1, [0,1,2,3,4,5,6,7])
        await sleep(1000);
        await PermissionEndpoints.connect(signer1).addOrganization("bank", PUBLIC_KEY_2, [0,1,2,3,4,5,6,7])
        await sleep(1000);
        await PermissionEndpoints.connect(signer1).addOrganization("users", PUBLIC_KEY_3, [0,1,6])
        await sleep(2000);
        
        console.log("Adding nodes...") 
        const rlf = readline.createInterface({
            input: fs.createReadStream(path.join(__dirname, '../../cryptogen/enodeIds.txt'))
        });
        for await (const enodeId of rlf) {
            if (enodeId) {
                await PermissionEndpoints.connect(signer1).addNode(enodeId, "", 0, 0)
            }
        }
        await sleep(1000);

        console.log("Adding users...")
        await PermissionEndpoints.connect(signer3).addRole("user", 1, [])
        await sleep(2000);
        await PermissionEndpoints.connect(signer3).addAccount(PUBLIC_KEY_4, "users_user", false)
    }
});

(async () => {
    console.log("Minting funds...")
    await Wallet.connect(signer2).mint(PUBLIC_KEY_1, 100000000)
    await sleep(1000);
    await Wallet.connect(signer2).mint(PUBLIC_KEY_2, 100000000)
    await sleep(1000);
    await Wallet.connect(signer2).mint(PUBLIC_KEY_3, 100000)
    await sleep(1000);
    await Wallet.connect(signer2).mint(PUBLIC_KEY_4, 100000)
    await sleep(1000);

    console.log("Minting realties...")

    const realty1 = {
        name: "Yuyuan Garden",
        ownership: PUBLIC_KEY_1,
        kind: "BUILDING",
        district: "Shanghai",
        location: "Downtown Shanghai, 2000-100 Shanghai, China",
        image: "https://www.intrepidtravel.com/adventures/wp-content/uploads/2017/08/china_shanghai_yuyuan-garden-city.jpg",
        totalArea: 100
    }
    const realty2 = {
        name: "Quinta do Lago",
        ownership: PUBLIC_KEY_1,
        kind: "HOUSE",
        district: "Alentejo",
        location: "Rua das Macieiras, 4002-200 Beja, Portugal",
        image: "https://www.the-yeatman-hotel.com/fotos/marcas/banner_1_3632649415bb49a128f13c.jpg",
        totalArea: 100
    }

    const realty3 = {
        name: "Edificio do Sol Nascente 3E",
        ownership: PUBLIC_KEY_1,
        kind: "APARTMENT",
        district: "Algarve",
        location: "Rua do Sol Nascente 3E, 1000-100 Quarteira, Portugal",
        image: "https://i0.wp.com/theconstructor.org/wp-content/uploads/2014/10/Residential-building.jpg",
        totalArea: 100
    }

    await RealtyFactory.connect(signer1).mint(realty1, [PUBLIC_KEY_3], [10000])
    await sleep(1000);
    await RealtyFactory.connect(signer1).mint(realty2, [PUBLIC_KEY_4], [10000])
    await sleep(1000);
    await RealtyFactory.connect(signer1).mint(realty3, [PUBLIC_KEY_3, PUBLIC_KEY_4], [4000, 6000])
    await sleep(2000);

    console.log("Issuing Documents...")
    await Compliance.connect(signer1).addDocumentation("BUILDING", "sale", getAddress.aDocumentAddress())
    await sleep(1000);

    console.log("Issuing Sale Agrements...");
    const realties = await RealtyFactory.connect(signer1).getRealtiesOf(PUBLIC_KEY_3);

    const saleDetails1 = {
        buyer: PUBLIC_KEY_4,
        seller: PUBLIC_KEY_3,
        realty: realties[0],
        share: 3000,
        price: 1000,
        earnest: 100,
        realtor: PUBLIC_KEY_1,
        comission: 0,
        contengencyPeriod: 10,
        contengencyClauses:  textEncoder.encode("foo")
    }

    await SaleAgreementFactory.connect(signer1).createSaleAgreement(saleDetails1);
    await sleep(1000);
    //Wallet.connect(signer4).approve('0x19f91B8C15200aC3536510496758367dfe9120a5', 100000);
    //await sleep(1000);
    //Wallet.connect(signer3).approve('0x19f91B8C15200aC3536510496758367dfe9120a5', 100000);

    console.log("Issuing Rental Agreements...")

    const rentalTerms1 = {
        realtyContract: realties[0],
        startDate: timeHelper.toSolidityTime(Date.now()),
        duration: 3, 
        rentValue: 200,
        securityDeposit: 100,
        securityReturnDueDate: 15,
        paymentDueDate: 1,
        latePaymentFee: 10,
        earlyTerminationFee: 50, 
        earlyTerminationNotice: 1,
        extra: 'extra terms', 
        payees: [], 
        shares: []
    };

    const rentalTerms2 = {
        realtyContract: realties[1],
        startDate: timeHelper.toSolidityTime(Date.now()),
        duration: 1, 
        rentValue: 50,
        securityDeposit: 10,
        securityReturnDueDate: 15,
        paymentDueDate: 1,
        latePaymentFee: 10,
        earlyTerminationFee: 50, 
        earlyTerminationNotice: 1,
        extra: 'extra terms', 
        payees: [], 
        shares: []
    };

    let OwnershipContract = new ethers.Contract(realties[0], getAbi.ownershipAbi(), provider);
    let createRentalData = abiEncoder.encodeRentalFactoryData('createRentalAgreement', [PUBLIC_KEY_4, rentalTerms1]);
    await OwnershipContract.connect(signer3).submitTransaction(getAddress.rentalFactoryAddress(), 0, createRentalData);
    await sleep(1000); 

    OwnershipContract = new ethers.Contract(realties[1], getAbi.ownershipAbi(), provider);
    createRentalData = abiEncoder.encodeRentalFactoryData('createRentalAgreement', [PUBLIC_KEY_4, rentalTerms2]);
    await OwnershipContract.connect(signer3).submitTransaction(getAddress.rentalFactoryAddress(), 0, createRentalData);

    console.log("Issuing Mortgage Loans...")
    const details1 = {
        lender: PUBLIC_KEY_1,
        borrower: PUBLIC_KEY_3,
        principal: 200000,
        downPayment: 5000,
        interestRate: 100,
        loanTerm: 3,
        startDate: timeHelper.toSolidityTime(Date.now()),
        gracePeriod: 10,
        latePaymentFee: 1000,
        defaultDeadline: 30
    }
    const details2 = {
        lender: PUBLIC_KEY_1,
        borrower: PUBLIC_KEY_4,
        principal: 200000,
        downPayment: 5000,
        interestRate: 100,
        loanTerm: 3,
        startDate: timeHelper.toSolidityTime(Date.now()),
        gracePeriod: 10,
        latePaymentFee: 1000,
        defaultDeadline: 30
    }
    
    await MortgageLoanFactory.connect(signer1).createMortgageLoan(details1);
    await sleep(1000);
    await MortgageLoanFactory.connect(signer1).createMortgageLoan(details2);

    console.log("Done!") 
  
})();

