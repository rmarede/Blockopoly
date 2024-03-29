const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ContractNameServiceModule", (m) => {

  const args = [[], []];

  const contract = m.contract("ContractNameService", args, {});

  return { contract };
});
