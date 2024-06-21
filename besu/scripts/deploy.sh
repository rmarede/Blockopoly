cd ../src

yes | npx hardhat ignition deploy ignition/modules/ContractNameService.js --network besu
yes | npx hardhat ignition deploy ignition/modules/Permissioning.js --network besu
yes | npx hardhat ignition deploy ignition/modules/General.js --network besu

cd ../scripts