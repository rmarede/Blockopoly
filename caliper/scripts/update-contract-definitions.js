const fs = require('fs');
const path = require('path');
const getAddress = require('../../besu/src/scripts/utils/get-address');
const getAbi = require('../../besu/src/scripts/utils/get-abi');
const getBytecode = require('../../besu/src/scripts/utils/get-bytecode');

const REALTY_FACTORY_DEF_PATH = path.join(__dirname, '../contracts/RealtyFactoryDefinition.json');
const WALLET_DEF_PATH = path.join(__dirname, '../contracts/WalletDefinition.json');
const SALE_FACTORY_DEF_PATH = path.join(__dirname, '../contracts/SaleAgreementFactoryDefinition.json');
const OWNERSHIP_DEF_PATH = path.join(__dirname, '../contracts/OwnershipDefinition.json');
const SALE_AGREEMENT_DEF_PATH = path.join(__dirname, '../contracts/SaleAgreementDefinition.json');

let realty_factory_definition = JSON.parse(fs.readFileSync(REALTY_FACTORY_DEF_PATH, 'utf8'));
let wallet_definition = JSON.parse(fs.readFileSync(WALLET_DEF_PATH, 'utf8'));
let sale_factory_definition = JSON.parse(fs.readFileSync(SALE_FACTORY_DEF_PATH, 'utf8'));
let ownership_definition = JSON.parse(fs.readFileSync(OWNERSHIP_DEF_PATH, 'utf8'));
let saleAgreement_definition = JSON.parse(fs.readFileSync(SALE_AGREEMENT_DEF_PATH, 'utf8'));

realty_factory_definition.address = getAddress.realtyFactoryAddress();
realty_factory_definition.abi = getAbi.realtyFactoryAbi();
realty_factory_definition.bytecode = getBytecode.realtyFactoryBytecode();

wallet_definition.address = getAddress.walletAddress();
wallet_definition.abi = getAbi.walletAbi();
wallet_definition.bytecode = getBytecode.walletBytecode();

sale_factory_definition.address = getAddress.saleFactoryAddress();
sale_factory_definition.abi = getAbi.saleFactoryAbi();
sale_factory_definition.bytecode = getBytecode.saleFactoryBytecode();

ownership_definition.abi = getAbi.ownershipAbi();
ownership_definition.bytecode = getBytecode.ownershipBytecode();

saleAgreement_definition.abi = getAbi.saleAgreementAbi();
saleAgreement_definition.bytecode = getBytecode.saleAgreementBytecode();

let updated_rfd = JSON.stringify(realty_factory_definition, null, 2);
let updated_wd = JSON.stringify(wallet_definition, null, 2);
let updated_sfd = JSON.stringify(sale_factory_definition, null, 2);
let updated_od = JSON.stringify(ownership_definition, null, 2);
let updated_sad = JSON.stringify(saleAgreement_definition, null, 2);

fs.writeFileSync(REALTY_FACTORY_DEF_PATH, updated_rfd);
fs.writeFileSync(WALLET_DEF_PATH, updated_wd);
fs.writeFileSync(SALE_FACTORY_DEF_PATH, updated_sfd);
fs.writeFileSync(OWNERSHIP_DEF_PATH, updated_od);
fs.writeFileSync(SALE_AGREEMENT_DEF_PATH, updated_sad);


const NETWORK_CONFIG_PATH = path.join(__dirname, '../networks/network-config.json');
let network_config = JSON.parse(fs.readFileSync(NETWORK_CONFIG_PATH, 'utf8'));
network_config.ethereum.contracts.RealtyFactory.address = getAddress.realtyFactoryAddress();
network_config.ethereum.contracts.Wallet.address = getAddress.walletAddress();
network_config.ethereum.contracts.SaleAgreementFactory.address = getAddress.saleFactoryAddress();
fs.writeFileSync(NETWORK_CONFIG_PATH, JSON.stringify(network_config, null, 4));


const ABIS_PATH = path.join(__dirname, '../deployment/abis.json');
let abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf8'));
abis['saleAgreementAbi'] = saleAgreement_definition.abi;
abis['OwnershipAbi'] = ownership_definition.abi;
fs.writeFileSync(ABIS_PATH, JSON.stringify(abis, null, 2));