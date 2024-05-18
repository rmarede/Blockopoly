const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

module.exports = buildModule("OrganizationRegistryModule", (m) => {

const cnsAddress = m.getParameter("_cns", CNS_ADDRESS);

  const contract = m.contract("OrganizationRegistry", [cnsAddress], {});

  return { contract };
});
