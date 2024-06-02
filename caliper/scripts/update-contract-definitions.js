const fs = require('fs');
const path = require('path');
const getAddress = require('../../besu/src/scripts/utils/get-address');
const getAbi = require('../../besu/src/scripts/utils/get-abi');

const NETWORK_CONFIG_PATH = path.join(__dirname, '../networks/network-config.json');
let network_config = JSON.parse(fs.readFileSync(NETWORK_CONFIG_PATH, 'utf8'));

network_config.ethereum.contracts.RealtyFactory.address = getAddress.realtyFactoryAddress();
network_config.ethereum.contracts.RealtyFactory.abi = getAbi.realtyFactoryAbi();

network_config.ethereum.contracts.Wallet.address = getAddress.walletAddress();
network_config.ethereum.contracts.Wallet.abi = getAbi.walletAbi();

network_config.ethereum.contracts.SaleAgreementFactory.address = getAddress.saleFactoryAddress();
network_config.ethereum.contracts.SaleAgreementFactory.abi = getAbi.saleFactoryAbi();

network_config.ethereum.contracts.Ownership.abi = getAbi.ownershipAbi();

network_config.ethereum.contracts.SaleAgreement.abi = getAbi.saleAgreementAbi();

fs.writeFileSync(NETWORK_CONFIG_PATH, JSON.stringify(network_config, null, 4));

const ABIS_PATH = path.join(__dirname, '../deployment/abis.json');
let abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf8'));
abis['saleAgreementAbi'] = getAbi.saleAgreementAbi();
abis['OwnershipAbi'] = getAbi.ownershipAbi();
fs.writeFileSync(ABIS_PATH, JSON.stringify(abis, null, 2));