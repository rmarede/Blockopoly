const fs = require('fs');
const file_path = './ignition/deployments/chain-1337/deployed_addresses.json';
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

function walletAddress() {
  return jsonContent['WalletModule#Wallet'];
}

function realtiesAddress() {
    return jsonContent['RealtiesModule#Realties'];
}

function saleFactoryAddress() {
    return jsonContent['SaleAgreementFactoryModule#SaleAgreementFactory'];
}

function mortgageFactoryAddress() {
    return jsonContent['MortgageLoanFactoryModule#MortgageLoanFactory'];
}

function rentalFactoryAddress() {
    return jsonContent['RentalAgreementFactoryModule#RentalAgreementFactory'];
}

function organizationVoterAddress() {
    return jsonContent['OrganizationVoterModule#OrganizationVoter'];
}

function permissionEndpointsAddress() {
    return jsonContent['PermissionEndpointsModule#PermissionEndpoints'];
}

function contractNameServiceAddress() {
    return jsonContent['ContractNameServiceModule#ContractNameService'];
}

function organizationRegistryAddress() {
    return jsonContent['OrganizationRegistryModule#OrganizationRegistry'];
}

function accountRegistryAddress() {
    return jsonContent['AccountRegistryModule#AccountRegistry'];
}

function roleRegistryAddress() {
    return jsonContent['RoleRegistryModule#RoleRegistry'];
}

function nodeRegistryAddress() {
    return jsonContent['NodeRegistryModule#NodeRegistry'];
}

module.exports = { walletAddress, realtiesAddress, saleFactoryAddress, mortgageFactoryAddress, rentalFactoryAddress, organizationVoterAddress, 
    permissionEndpointsAddress, contractNameServiceAddress, organizationRegistryAddress, accountRegistryAddress, roleRegistryAddress, 
    nodeRegistryAddress 
};
