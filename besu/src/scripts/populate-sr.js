const ethers = require('ethers');
const fs = require('fs');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer = wallet.connect(provider);

const SERVICE_RESOLVER_ABI = JSON.parse(fs.readFileSync('../artifacts/contracts/system/ServiceResolver.sol/ServiceResolver.json', 'utf8')).abi;

const DEPLOYED_ADDRESSES_PATH = '../ignition/deployments/chain-1337/deployed_addresses.json'; 
const jsonContent = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf8'))
const SERVICE_RESOLVER_ADDRESS = jsonContent['ServiceResolverModule#ServiceResolver'];
const ERC20_ADDRESS = jsonContent['ERC20Module#ERC20'];
const ERC721_ADDRESS =  jsonContent['ERC721Module#ERC721'];
const MARKETPLACE_ADDRESS =  jsonContent['MarketplaceModule#Marketplace'];

const service_resolver = new ethers.Contract(SERVICE_RESOLVER_ADDRESS, SERVICE_RESOLVER_ABI, signer);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    await service_resolver.setContractAddress("ERC20", ERC20_ADDRESS);
    await sleep(1000);
    await service_resolver.setContractAddress("ERC721", ERC721_ADDRESS);
    await sleep(1000);
    await service_resolver.setContractAddress("Marketplace", MARKETPLACE_ADDRESS);
    
    await sleep(2000);
    console.log("Service Resolver populated with addresses:");

    console.log(await service_resolver.getContractHistory());
  })();


