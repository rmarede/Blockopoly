const ethers = require('ethers');
const fs = require('fs');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const ethers_wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = ethers_wallet.connect(provider);

const PERM_ENDPOINTS_ABI = JSON.parse(fs.readFileSync('../artifacts/contracts/permissioning/PermissionEndpoints.sol/PermissionEndpoints.json', 'utf8')).abi;

const DEPLOYED_ADDRESSES_PATH = '../ignition/deployments/chain-1337/deployed_addresses.json'; 
const jsonContent = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf8'))
const PERM_ENDPOINTS_ADDRESS = jsonContent['PermissionEndpointsModule#PermissionEndpoints'];

const perm_endpoints = new ethers.Contract(PERM_ENDPOINTS_ADDRESS, PERM_ENDPOINTS_ABI, signer);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    await perm_endpoints.addOrganization("org1", signer.address, [0,1,2,3,4,5,6,7])
})();

