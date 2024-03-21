const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ERC721Module", (m) => {

  const contract = m.contract("ERC721", [], {});

  return { contract };
});
