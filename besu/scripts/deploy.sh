
cd ../src

npx hardhat compile
npx hardhat ignition deploy ignition/modules/erc20.js --network besu
npx hardhat ignition deploy ignition/modules/erc721.js --network besu

cd ../scripts

