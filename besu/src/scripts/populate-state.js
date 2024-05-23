const ethers = require('ethers');
const getAbi = require('./utils/get-abi');
const getAddress = require('./utils/get-address');
const timeHelper = require('./utils/time-helper');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

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

const Wallet = new ethers.Contract(getAddress.walletAddress(), getAbi.walletAbi(), provider);
const RealtyFactory = new ethers.Contract(getAddress.realtyFactoryAddress(), getAbi.realtyFactoryAbi(), provider);
const PermissionEndpoints = new ethers.Contract(getAddress.permissionEndpointsAddress(), getAbi.permissionEndpointsAbi(), provider);
const RoleRegistry = new ethers.Contract(getAddress.roleRegistryAddress(), getAbi.roleRegistryAbi(), provider);
const RentalAgreementFactory = new ethers.Contract(getAddress.rentalFactoryAddress(), getAbi.rentalFactoryAbi(), provider);
const SaleAgreementFactory = new ethers.Contract(getAddress.saleFactoryAddress(), getAbi.saleFactoryAbi(), provider);
const MortgageLoanFactory = new ethers.Contract(getAddress.mortgageFactoryAddress(), getAbi.mortgageFactoryAbi(), provider);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log("Adding organizations...")
    await PermissionEndpoints.connect(signer1).addOrganization("gov", PUBLIC_KEY_1, [0,1,2,3,4,5,6,7])
    await PermissionEndpoints.connect(signer1).addOrganization("users", PUBLIC_KEY_2, [0,1,6])
    await sleep(3000);
    
    console.log("Adding nodes...") 
    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname, '../../cryptogen/enodeIds.txt'))
    });
    for await (const enodeId of rl) {
        if (enodeId) {
            await PermissionEndpoints.connect(signer1).addNode(enodeId, "", 0, 0)
        }
    }
    await sleep(1000);

    console.log("Adding users...")
    await PermissionEndpoints.connect(signer2).addRole("user", 1, [])
    await sleep(3000);
    //console.log(await RoleRegistry.connect(signer1).getRoles())
    await PermissionEndpoints.connect(signer2).addAccount(PUBLIC_KEY_3, "users_user", false)
    await PermissionEndpoints.connect(signer2).addAccount(PUBLIC_KEY_4, "users_user", false)

    console.log("Minting funds...")
    await Wallet.connect(signer1).mint(PUBLIC_KEY_1, 100000000)
    await Wallet.connect(signer1).mint(PUBLIC_KEY_3, 100000)
    await Wallet.connect(signer1).mint(PUBLIC_KEY_4, 100000)

    console.log("Minting realties...")
    const realty1 = {
        name: "Edificio Antonio Marques",
        ownership: PUBLIC_KEY_1,
        district: "Lisbon",
        postalCode: 2755455,
        street: "av. da liberdade",
        number: 25,
        totalArea: 118
    }
    const realty2 = {
        name: "Quinta do Lago",
        ownership: PUBLIC_KEY_1,
        district: "Porto",
        postalCode: 2345112,
        street: "central route",
        number: 1,
        totalArea: 290
    }

    const realty3 = {
        name: "Edificio do Sol Nascente 3E",
        ownership: PUBLIC_KEY_1,
        district: "Algarve",
        postalCode: 2193829,
        street: "rua das palmeiras",
        number: 37,
        totalArea: 68
    }

    await RealtyFactory.connect(signer1).mint(realty1, [PUBLIC_KEY_3], [10000])
    await RealtyFactory.connect(signer1).mint(realty2, [PUBLIC_KEY_4], [10000])
    await RealtyFactory.connect(signer1).mint(realty3, [PUBLIC_KEY_3, PUBLIC_KEY_4], [4000, 6000])

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
        defaultDeadline: 3
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
        defaultDeadline: 3
    }
    
    await MortgageLoanFactory.createMortgageLoan(details1);
    await MortgageLoanFactory.createMortgageLoan(details2);

    console.log("Done!") 
  
})();

