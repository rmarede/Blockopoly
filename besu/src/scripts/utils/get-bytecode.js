const fs = require('fs');
const path = require('path');
const CONTRACTS_PATH = path.join(__dirname, '../../artifacts/contracts/');

function realtyFactoryBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'RealtyFactory.sol/RealtyFactory.json', 'utf8')).bytecode;
}

function walletBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Wallet.sol/Wallet.json', 'utf8')).bytecode;
}

function saleFactoryBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'factory/SaleAgreementFactory.sol/SaleAgreementFactory.json', 'utf8')).bytecode;
}

function saleAgreementBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'SaleAgreement.sol/SaleAgreement.json', 'utf8')).bytecode;
}

function ownershipBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Ownership.sol/Ownership.json', 'utf8')).bytecode;
}

module.exports = { realtyFactoryBytecode, walletBytecode, saleFactoryBytecode, saleAgreementBytecode, ownershipBytecode
};