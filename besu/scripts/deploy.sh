
cd ../src

npx hardhat ignition deploy ignition/modules/ServiceResolver.js --network besu
npx hardhat ignition deploy ignition/modules/erc20.js --network besu
npx hardhat ignition deploy ignition/modules/erc721.js --network besu
npx hardhat ignition deploy ignition/modules/marketplace.js --network besu

cd ../scripts

