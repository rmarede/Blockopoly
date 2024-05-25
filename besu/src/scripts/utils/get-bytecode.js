const fs = require('fs');
const path = require('path');
const CONTRACTS_PATH = path.join(__dirname, '../../artifacts/contracts/');

function realtyFactoryBytecode() {
  return JSON.parse(fs.readFileSync(CONTRACTS_PATH + 'RealtyFactory.sol/RealtyFactory.json', 'utf8')).bytecode;
}


module.exports = { realtyFactoryBytecode
};