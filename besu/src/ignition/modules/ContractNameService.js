const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ContractNameServiceModule", (m) => {

  const contract = m.contract("ContractNameService", [], {});

  return { contract };
});
