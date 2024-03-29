const { executionAsyncId } = require('async_hooks');
const ethers = require('ethers');
const fs = require('fs');
const readline = require('readline');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PRIVATE_KEY_2 = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet1 = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer1 = wallet1.connect(provider);
const wallet2 = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer2 = wallet2.connect(provider);

const ABI_PATH = '../artifacts/contracts/interface/';
const ERC20_ABI = JSON.parse(fs.readFileSync(ABI_PATH + 'IERC20.sol/IERC20.json', 'utf8')).abi;
const ERC721_ABI = JSON.parse(fs.readFileSync(ABI_PATH + 'IERC721.sol/IERC721.json', 'utf8')).abi;
const MARKETPLACE_ABI = JSON.parse(fs.readFileSync('../artifacts/contracts/Marketplace.sol/Marketplace.json', 'utf8')).abi;

const ADDRESSES_PATH = '../ignition/deployments/chain-1337/deployed_addresses.json'; 
const jsonContent = JSON.parse(fs.readFileSync(ADDRESSES_PATH, 'utf8'))
const ERC20_ADDRESS = jsonContent['ERC20Module#ERC20'];
const ERC721_ADDRESS =  jsonContent['ERC721Module#ERC721'];
const MARKETPLACE_ADDRESS =  jsonContent['MarketplaceModule#Marketplace'];

async function mint20(amount, signer) {
  const ERC20 = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, signer);
  await ERC20.mint(signer.address, amount);
}

async function mint721(tokenId, signer) {
  const ERC721 = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, signer);
  await ERC721.mint(signer.address, tokenId);
}

async function balance(signer) {
  const ERC20 = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, signer);
  console.log(await ERC20.balanceOf(signer.address));
}

async function owner(tokenId, signer) {
  const ERC721 = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, signer);
  console.log(await ERC721.ownerOf(tokenId));
}

async function approve(tokenId, signer) {
  const ERC721 = new ethers.Contract(ERC721_ADDRESS, ERC721_ABI, signer);
  await ERC721.approve(MARKETPLACE_ADDRESS, tokenId);
}

async function post(tokenId, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  await MARKETPLACE.postSale(tokenId, 10, 200);
}

async function get(tokenId, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  console.log(await MARKETPLACE.getSale(tokenId));
}

async function bid(tokenId, value, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  await MARKETPLACE.bid(tokenId, value);
}

async function getBids(tokenId, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  console.log(await MARKETPLACE.getSaleBids(tokenId));
}

async function close(tokenId, bidId, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  await MARKETPLACE.closeSale(tokenId, bidId);
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Enter a command: <command> <signer(1/2)> <param1> <param2> ... (type "exit" to quit)');

rl.on('line', (input) => {
  console.log(`You entered: ${input}`);
  const [command, ...args] = input.split(' ');

  const signer = args[0] === '1' ? signer1 : signer2;
  
  switch (command) {
    case 'exit':
      rl.close();
      break;
    case 'mint20':
      mint20(args[1], signer);
      break;
    case 'mint721':
      mint721(args[1], signer);
      break;
    case 'balance':
      balance(signer);
      break;
    case 'owner':
      owner(args[1], signer);
      break;
    case 'approve':
      approve(args[1], signer);
      break;
    case 'post':
      post(args[1], signer);
      break;
    case 'get':
      get(args[1], signer);
      break;
    case 'bid':
      bid(args[1], args[2], signer);
      break;
    case 'getBids':
      getBids(args[1], signer);
      break;
    case 'close':
      close(args[1], args[2], signer);
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Known commands: mint20, mint721, balance, owner, approve, post, get');
  }

  console.log('Enter a command: <command> <signer(1/2)> <param1> <param2> ... (type "exit" to quit)');
});

rl.on('close', () => {
  process.exit(0);
});
