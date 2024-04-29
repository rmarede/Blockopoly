require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    besu: {
      url: "http://localhost:8500",
      chainId: 1337,
      accounts: ["0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"],
      from: "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
    }
  },
};
