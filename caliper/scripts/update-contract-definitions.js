const fs = require('fs');
const path = require('path');
const getAddress = require('../../besu/src/scripts/utils/get-address');
const getAbi = require('../../besu/src/scripts/utils/get-abi');
const getBytecode = require('../../besu/src/scripts/utils/get-bytecode');

const REALTY_FACTORY_DEF_PATH = path.join(__dirname, '../contracts/RealtyFactoryDefinition.json');
let realty_factory_definition = JSON.parse(fs.readFileSync(REALTY_FACTORY_DEF_PATH, 'utf8'));
realty_factory_definition.address = getAddress.realtyFactoryAddress();
realty_factory_definition.abi = getAbi.realtyFactoryAbi();
realty_factory_definition.bytecode = getBytecode.realtyFactoryBytecode();

let updated_rfd = JSON.stringify(realty_factory_definition, null, 2);
fs.writeFileSync(REALTY_FACTORY_DEF_PATH, updated_rfd);


const NETWORK_CONFIG_PATH = path.join(__dirname, '../networks/network-config.json');
let network_config = JSON.parse(fs.readFileSync(NETWORK_CONFIG_PATH, 'utf8'));
network_config.ethereum.contracts.RealtyFactory.address = getAddress.realtyFactoryAddress();

let updatedConfig = JSON.stringify(network_config, null, 4);
fs.writeFileSync(NETWORK_CONFIG_PATH, updatedConfig);