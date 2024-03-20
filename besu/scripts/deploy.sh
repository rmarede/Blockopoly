
cd ../src

npx hardhat compile
npx hardhat ignition deploy ignition/modules/Lock.js --network besu

cd ../scripts

