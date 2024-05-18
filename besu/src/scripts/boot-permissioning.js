const ethers = require('ethers');
const fs = require('fs');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = wallet.connect(provider);

const NODE_PERMISSIONS_ADDRESS = '0x0000000000000000000000000000000000001111';
const ACCOUNT_PERMISSIONS_ADDRESS = '0x0000000000000000000000000000000000002222';

const ABI_PATH = '../artifacts/contracts/permissioning';
const NODE_PERMISSIONS_ABI = JSON.parse(fs.readFileSync(ABI_PATH + '/NodePermissions.sol/NodePermissions.json', 'utf8')).abi;
const ACCOUNT_PERMISSIONS_ABI = JSON.parse(fs.readFileSync(ABI_PATH + '/AccountPermissions.sol/AccountPermissions.json', 'utf8')).abi;

const node_permissions = new ethers.Contract(NODE_PERMISSIONS_ADDRESS, NODE_PERMISSIONS_ABI, signer);
const account_permissions = new ethers.Contract(ACCOUNT_PERMISSIONS_ADDRESS, ACCOUNT_PERMISSIONS_ABI, signer);

const DEPLOYED_ADDRESSES_PATH = '../ignition/deployments/chain-1337/deployed_addresses.json'; 
const jsonContent = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO deploy organization voter

(async () => {
    await node_permissions.boot(CNS_ADDRESS);
    await sleep(1000);
    //await account_permissions.boot(CNS_ADDRESS);
  })();

