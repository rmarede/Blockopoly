const fs = require('fs');

const CONTRACTS_PATH = './artifacts/contracts/';

function getERC20Abi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'interface/IERC20.sol/IERC20.json', 'utf8')).abi;
}

function getWalletAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Wallet.sol/Wallet.json', 'utf8')).abi;
}

function getMarketplaceAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Marketplace.sol/Marketplace.json', 'utf8')).abi;
}

function getOwnershipAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Ownership.sol/Ownership.json', 'utf8')).abi;
}

function getRentalAgreementAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'RentalAgreement.sol/RentalAgreement.json', 'utf8')).abi;
}

function getWeightedMultiSigAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/WeightedMultiSig.sol/WeightedMultiSig.json', 'utf8')).abi;
}

function getOrganizationVoterAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/OrganizationVoter.sol/OrganizationVoter.json', 'utf8')).abi;
}

function getPermissionEndpointsAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/PermissionEndpoints.sol/PermissionEndpoints.json', 'utf8')).abi;
}


module.exports = { getERC20Abi, getWalletAbi, getMarketplaceAbi, getOwnershipAbi, getRentalAgreementAbi, getWeightedMultiSigAbi, getOrganizationVoterAbi, getPermissionEndpointsAbi };