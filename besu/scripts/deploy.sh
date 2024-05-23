cd ../src

yes | npx hardhat ignition deploy ignition/modules/ContractNameService.js --network besu
yes | npx hardhat ignition deploy ignition/modules/Permissioning.js --network besu
yes | npx hardhat ignition deploy ignition/modules/Wallet.js --network besu
yes | npx hardhat ignition deploy ignition/modules/Factory.js --network besu

cd ../scripts