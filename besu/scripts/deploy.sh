cd ../src

yes | npx hardhat ignition deploy ignition/modules/ContractNameService.js --network besu

yes | npx hardhat ignition deploy ignition/modules/OrganizationRegistry.js --network besu
yes | npx hardhat ignition deploy ignition/modules/AccountRegistry.js --network besu
yes | npx hardhat ignition deploy ignition/modules/NodeRegistry.js --network besu
yes | npx hardhat ignition deploy ignition/modules/RoleRegistry.js --network besu

yes | npx hardhat ignition deploy ignition/modules/PermissionEndpoints.js --network besu

yes | npx hardhat ignition deploy ignition/modules/SaleAgreementFactory.js --network besu
yes | npx hardhat ignition deploy ignition/modules/RentalAgreementFactory.js --network besu
yes | npx hardhat ignition deploy ignition/modules/MortgageLoanFactory.js --network besu

yes | npx hardhat ignition deploy ignition/modules/Realties.js --network besu
yes | npx hardhat ignition deploy ignition/modules/Wallet.js --network besu

cd ../scripts