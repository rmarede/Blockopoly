
cd ../src

npx hardhat ignition deploy ignition/modules/ContractNameService.js --network besu

npx hardhat ignition deploy ignition/modules/OrganizationRegistry.js --network besu
npx hardhat ignition deploy ignition/modules/AccountRegistry.js --network besu
npx hardhat ignition deploy ignition/modules/NodeRegistry.js --network besu
npx hardhat ignition deploy ignition/modules/RoleRegistry.js --network besu

npx hardhat ignition deploy ignition/modules/PermissionEndpoints.js --network besu

npx hardhat ignition deploy ignition/modules/SaleAgreementFactory.js --network besu
npx hardhat ignition deploy ignition/modules/RentalAgreementFactory.js --network besu
npx hardhat ignition deploy ignition/modules/MortgageLoanFactory.js --network besu

npx hardhat ignition deploy ignition/modules/Realties.js --network besu
npx hardhat ignition deploy ignition/modules/Wallet.js --network besu

cd ../scripts

