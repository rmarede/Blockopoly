const fs = require('fs');
const path = require('path');
const CONTRACTS_PATH = path.join(__dirname, '../../artifacts/contracts/');

function cnsAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'system/ContractNameService.sol/ContractNameService.json', 'utf8')).abi;
}

function walletAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Wallet.sol/Wallet.json', 'utf8')).abi;
}

function ownershipAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'Ownership.sol/Ownership.json', 'utf8')).abi;
}

function complianceAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'compliance/Compliance.sol/Compliance.json', 'utf8')).abi;
}

function aDocumentAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'compliance/ADocument.sol/ADocument.json', 'utf8')).abi;
}

function rentalAgreementAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'RentalAgreement.sol/RentalAgreement.json', 'utf8')).abi;
}

function saleAgreementAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'SaleAgreement.sol/SaleAgreement.json', 'utf8')).abi;
}

function realtyFactoryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'factory/RealtyFactory.sol/RealtyFactory.json', 'utf8')).abi;
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

function multisignableAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/Multisignable.sol/Multisignable.json', 'utf8')).abi;
}

function organizationVoterAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'governance/OrganizationVoter.sol/OrganizationVoter.json', 'utf8')).abi;
}

function permissionEndpointsAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/PermissionEndpoints.sol/PermissionEndpoints.json', 'utf8')).abi;
}

function roleRegistryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/RoleRegistry.sol/RoleRegistry.json', 'utf8')).abi;
}

function accountRegistryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/AccountRegistry.sol/AccountRegistry.json', 'utf8')).abi;
}

function organizationRegistryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/OrganizationRegistry.sol/OrganizationRegistry.json', 'utf8')).abi;
}

function nodeRegistryAbi() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'permissioning/NodeRegistry.sol/NodeRegistry.json', 'utf8')).abi;
}


module.exports = { walletAbi, realtyFactoryAbi, ownershipAbi, rentalAgreementAbi, rentalFactoryAbi, saleAgreementAbi,
  weightedMultiSigAbi, organizationVoterAbi, permissionEndpointsAbi, cnsAbi, saleFactoryAbi, mortgageFactoryAbi, 
  roleRegistryAbi, accountRegistryAbi, organizationRegistryAbi, nodeRegistryAbi, complianceAbi, aDocumentAbi, multisignableAbi
};