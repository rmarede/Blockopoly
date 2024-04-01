const fs = require('fs');

const CONTRACTS_PATH = './artifacts/contracts/';

function getERC20Abi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'interface/IERC20.sol/IERC20.json', 'utf8')).abi;
}

function getERC721Abi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'interface/IERC721.sol/IERC721.json', 'utf8')).abi;
}

function getMarketplaceAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Marketplace.sol/Marketplace.json', 'utf8')).abi;
}

function getOwnershipAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Ownership.sol/Ownership.json', 'utf8')).abi;
}

module.exports = { getERC20Abi, getERC721Abi, getMarketplaceAbi, getOwnershipAbi };