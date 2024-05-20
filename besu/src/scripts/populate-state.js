const ethers = require('ethers');
const getAbi = require('./utils/get-abi');
const getAddress = require('./utils/get-address');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const ethers_wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = ethers_wallet.connect(provider);

const perm_endpoints = new ethers.Contract(getAddress.permissionEndpointsAddress(), getAbi.permissionEndpointsAbi(), signer);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    await perm_endpoints.addOrganization("org1", signer.address, [0,1,2,3,4,5,6,7])
})();

