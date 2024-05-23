const fs = require('fs');
const path = require('path');
const file_path = path.join(__dirname, '../../ignition/deployments/chain-1337/deployed_addresses.json');
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

function walletAddress() {
  return jsonContent['WalletModule#Wallet'];
}

function realtyFactoryAddress() {
    return jsonContent['FactoryModule#RealtyFactory'];
}

function saleFactoryAddress() {
    return jsonContent['FactoryModule#SaleAgreementFactory'];
}

function mortgageFactoryAddress() {
    return jsonContent['FactoryModule#MortgageLoanFactory'];
}

function rentalFactoryAddress() {
    return jsonContent['FactoryModule#RentalAgreementFactory'];
}

function organizationVoterAddress() {
    return jsonContent['OrganizationVoterModule#OrganizationVoter'];
}

function permissionEndpointsAddress() {
    return jsonContent['PermissioningModule#PermissionEndpoints'];
}

function contractNameServiceAddress() {
    return jsonContent['ContractNameServiceModule#ContractNameService'];
}

function organizationRegistryAddress() {
    return jsonContent['PermissioningModule#OrganizationRegistry'];
}

function accountRegistryAddress() {
    return jsonContent['PermissioningModule#AccountRegistry'];
}

function roleRegistryAddress() {
    return jsonContent['PermissioningModule#RoleRegistry'];
}

function nodeRegistryAddress() {
    return jsonContent['PermissioningModule#NodeRegistry'];
}

module.exports = { walletAddress, realtyFactoryAddress, saleFactoryAddress, mortgageFactoryAddress, rentalFactoryAddress, organizationVoterAddress, 
    permissionEndpointsAddress, contractNameServiceAddress, organizationRegistryAddress, accountRegistryAddress, roleRegistryAddress, 
    nodeRegistryAddress 
};
