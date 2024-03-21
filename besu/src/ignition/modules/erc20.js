const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("LockModule", (m) => {
  //const param1 = m.getParameter("param1", "param1_value");

  const contract = m.contract("erc20", [], {});

  return { contract };
});
