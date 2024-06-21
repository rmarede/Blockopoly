const ethers = require('ethers');
const getAddress = require('./utils/get-address');
const getAbi = require('./utils/get-abi');
const readline = require('readline');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = wallet.connect(provider);

const cns = new ethers.Contract(getAddress.contractNameServiceAddress(), getAbi.cnsAbi(), signer);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("[INFO] Populating CNS...");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to set the permissioning addresses? (y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
        await cns.setContractAddress("OrganizationRegistry", getAddress.organizationRegistryAddress());
        await sleep(1000);
        await cns.setContractAddress("AccountRegistry", getAddress.accountRegistryAddress());
        await sleep(1000);
        await cns.setContractAddress("RoleRegistry", getAddress.roleRegistryAddress());
        await sleep(1000);
        await cns.setContractAddress("NodeRegistry", getAddress.nodeRegistryAddress());
        await sleep(1000);
        await cns.setContractAddress("PermissionEndpoints", getAddress.permissionEndpointsAddress());
        await sleep(1000);
    }
    await cns.setContractAddress("SaleAgreementFactory", getAddress.saleFactoryAddress());
    await sleep(1000);
    await cns.setContractAddress("RentalAgreementFactory", getAddress.rentalFactoryAddress());
    await sleep(1000);
    await cns.setContractAddress("MortgageLoanFactory", getAddress.mortgageFactoryAddress());
    await sleep(1000);
    await cns.setContractAddress("Wallet", getAddress.walletAddress());
    await sleep(1000);
    await cns.setContractAddress("RealtyFactory", getAddress.realtyFactoryAddress());
    await sleep(2000);
    console.log("[INFO] CNS populated with addresses:");
    console.log(await cns.getContractHistory());

    rl.close();
});
