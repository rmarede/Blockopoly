const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ERC20Module", (m) => {

  const contract = m.contract("ERC20", [], {});

  return { contract };
});
