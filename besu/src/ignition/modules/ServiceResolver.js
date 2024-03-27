const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ServiceResolverModule", (m) => {

  const contract = m.contract("ServiceResolver", [], {});

  return { contract };
});
