const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const ERC20_ADDRESS = jsonContent['ERC20Module#ERC20'];
const ERC721_ADDRESS =  jsonContent['ERC721Module#ERC721'];

module.exports = buildModule("MarketplaceModule", (m) => {

  const erc20Address = m.getParameter("erc20Address", ERC20_ADDRESS);
  const erc721Address = m.getParameter("erc721Address", ERC721_ADDRESS);

  const contract = m.contract("Marketplace", [erc20Address, erc721Address], {});

  return { contract };
});