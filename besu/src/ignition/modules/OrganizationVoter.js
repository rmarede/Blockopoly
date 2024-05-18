const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

module.exports = buildModule("OrganizationVoterModule", (m) => {

const cnsAddress = m.getParameter("_cns", CNS_ADDRESS);

  const contract = m.contract("OrganizationVoter", [cnsAddress], {});

  return { contract };
});
