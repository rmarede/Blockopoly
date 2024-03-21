const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MarketplaceModule", (m) => {

  const contract = m.contract("Marketplace", [], {});

  return { contract };
});