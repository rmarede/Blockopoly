const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

module.exports = buildModule("RealtiesModule", (m) => {

const cnsAddress = m.getParameter("_cns", CNS_ADDRESS);

console.log(process.cwd());

const ARRAYS_ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/utils/Arraysz.sol/Arraysz.json', 'utf8')).abi;
const arraysz = m.library("Arraysz", ARRAYS_ABI, {});

const contract = m.contract("Realties", [cnsAddress], {
  libraries: {
    Arraysz: arraysz,
  },
});

  return { contract };
});
