const ethers = require('ethers');
const fs = require('fs');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = wallet.connect(provider);

const CNS_ABI = JSON.parse(fs.readFileSync('../artifacts/contracts/system/ContractNameService.sol/ContractNameService.json', 'utf8')).abi;

const DEPLOYED_ADDRESSES_PATH = '../ignition/deployments/chain-1337/deployed_addresses.json'; 
const jsonContent = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf8'))
const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];
const ORG_REGISTRY_ADDRESS = jsonContent['OrganizationRegistryModule#OrganizationRegistry'];
const ACC_REGISTRY_ADDRESS = jsonContent['AccountRegistryModule#AccountRegistry'];
const ROLE_REGISTRY_ADDRESS = jsonContent['RoleRegistryModule#RoleRegistry'];
const NODE_REGISTRY_ADDRESS = jsonContent['NodeRegistryModule#NodeRegistry'];
const PERM_ENDPOINTS_ADDRESS = jsonContent['PermissionEndpointsModule#PermissionEndpoints'];
const SALE_FACTORY_ADDRESS = jsonContent['SaleAgreementFactoryModule#SaleAgreementFactory'];
const RENTAL_FACTORY_ADDRESS = jsonContent['RentalAgreementFactoryModule#RentalAgreementFactory'];
const MORTGAGE_FACTORY_ADDRESS = jsonContent['MortgageLoanFactoryModule#MortgageLoanFactory'];
const WALLET_ADDRESS = jsonContent['WalletModule#ERC20'];
const REALTIES_ADDRESS = jsonContent['RealtiesModule#Realties'];

const cns = new ethers.Contract(CNS_ADDRESS, CNS_ABI, signer);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    await cns.setContractAddress("OrganizationRegistry", ORG_REGISTRY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("AccountRegistry", ACC_REGISTRY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("RoleRegistry", ROLE_REGISTRY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("NodeRegistry", NODE_REGISTRY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("PermissionEndpoints", PERM_ENDPOINTS_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("SaleAgreementFactory", SALE_FACTORY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("RentalAgreementFactory", RENTAL_FACTORY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("MortgageLoanFactory", MORTGAGE_FACTORY_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("Wallet", WALLET_ADDRESS);
    await sleep(1000);
    await cns.setContractAddress("Realties", REALTIES_ADDRESS);
    await sleep(2000);
    console.log("CNS populated with addresses:");
    console.log(await cns.getContractHistory());
  })();


