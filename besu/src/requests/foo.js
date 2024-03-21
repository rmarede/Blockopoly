const { executionAsyncId } = require('async_hooks');
const ethers = require('ethers');
const fs = require('fs');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PRIVATE_KEY_2 = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

//const provider = new ethers.JsonRpcApiProvider('http://localhost:8500');
const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet1 = new ethers.Wallet(PRIVATE_KEY_1, provider);
const wallet2 = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer1 = wallet1.connect(provider);
const signer2 = wallet2.connect(provider);

const ABI_PATH = '../artifacts/contracts/interface/';

const ERC20_ABI = JSON.parse(fs.readFileSync(ABI_PATH + 'IERC20.sol/IERC20.json', 'utf8')).abi;
const ERC20_ADDRESS = '0x42699A7612A82f1d9C36148af9C77354759b210b';

const ERC721_ABI = JSON.parse(fs.readFileSync(ABI_PATH + 'IERC721.sol/IERC721.json', 'utf8')).abi;
const ERC721_ADDRESS = '0xa50a51c09a5c451C52BB714527E1974b686D8e77';

const MARKETPLACE_ABI = JSON.parse(fs.readFileSync('../artifacts/contracts/Marketplace.sol/Marketplace.json', 'utf8')).abi;
const MARKETPLACE_ADDRESS = '0x9a3DBCa554e9f6b9257aAa24010DA8377C57c17e';


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
  console.log(await MARKETPLACE.postSale(tokenId));
}

async function get(tokenId, signer) {
  const MARKETPLACE = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
  console.log(await MARKETPLACE.getSale(tokenId));
}

//mint20(1000, signer1);
//balance(signer1);

//mint721(123123, signer1);
//owner(123123, signer1);

//approve(123123, signer1);
//post(123123, signer1);
get(123123, signer1);
