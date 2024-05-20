const fs = require('fs');

const CONTRACTS_PATH = './artifacts/contracts/';

function cnsAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'system/ContractNameService.sol/ContractNameService.json', 'utf8')).abi;
}

function walletAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Wallet.sol/Wallet.json', 'utf8')).abi;
}

function realtiesAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Realties.sol/Realties.json', 'utf8')).abi;
}

function ownershipAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Ownership.sol/Ownership.json', 'utf8')).abi;
}

function rentalAgreementAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'RentalAgreement.sol/RentalAgreement.json', 'utf8')).abi;
}

function saleAgreementAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'SaleAgreement.sol/SaleAgreement.json', 'utf8')).abi;
}

function rentalFactoryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'factory/RentalAgreementFactory.sol/RentalAgreementFactory.json', 'utf8')).abi;
}

function saleFactoryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'factory/SaleAgreementFactory.sol/SaleAgreementFactory.json', 'utf8')).abi;
}

function mortgageFactoryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'factory/MortgageLoanFactory.sol/MortgageLoanFactory.json', 'utf8')).abi;
}

function weightedMultiSigAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/WeightedMultiSig.sol/WeightedMultiSig.json', 'utf8')).abi;
}

function organizationVoterAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/OrganizationVoter.sol/OrganizationVoter.json', 'utf8')).abi;
}

function permissionEndpointsAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/PermissionEndpoints.sol/PermissionEndpoints.json', 'utf8')).abi;
}


module.exports = { walletAbi, realtiesAbi, ownershipAbi, rentalAgreementAbi, rentalFactoryAbi, saleAgreementAbi,
  weightedMultiSigAbi, organizationVoterAbi, permissionEndpointsAbi, cnsAbi, saleFactoryAbi, mortgageFactoryAbi
};