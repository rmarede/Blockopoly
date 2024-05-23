const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

module.exports = buildModule("PermissioningModule", (m) => {

    const cnsAddress = m.getParameter("_cns", CNS_ADDRESS);

    const accRegistry = m.contract("AccountRegistry", [cnsAddress], {});
    const roleRegistry = m.contract("RoleRegistry", [cnsAddress], {});
    const nodeRegistry = m.contract("NodeRegistry", [cnsAddress], {});
    const orgRegistry = m.contract("OrganizationRegistry", [cnsAddress], {});

    const permEndpoints = m.contract("PermissionEndpoints", [cnsAddress], {});

    return { accRegistry, roleRegistry, nodeRegistry, orgRegistry, permEndpoints };
});
