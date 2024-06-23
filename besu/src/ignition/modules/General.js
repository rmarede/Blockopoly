const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs');

const file_path = './ignition/deployments/chain-1337/deployed_addresses.json'; // working directory is at /src
const jsonContent = JSON.parse(fs.readFileSync(file_path, 'utf8'))

const CNS_ADDRESS = jsonContent['ContractNameServiceModule#ContractNameService'];

module.exports = buildModule("GeneralModule", (m) => {

    const cnsAddress = m.getParameter("_cns", CNS_ADDRESS);

    const saleFactory = m.contract("SaleAgreementFactory", [cnsAddress], {});
    const loanFactory = m.contract("MortgageLoanFactory", [cnsAddress], {});
    const rentalFactory = m.contract("RentalAgreementFactory", [cnsAddress], {});

    const ARRAYS_ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/utils/Arraysz.sol/Arraysz.json', 'utf8')).abi;
    const arraysz = m.library("Arraysz", ARRAYS_ABI, {});

    const realtyFactory = m.contract("RealtyFactory", [cnsAddress], {
        libraries: {
            Arraysz: arraysz,
        },
    });

    const wallet = m.contract("Wallet", [cnsAddress], {});
	const compliance = m.contract("Compliance", [cnsAddress], {});
    const aDocument = m.contract("ADocument", [cnsAddress], {});

    return { saleFactory, loanFactory, rentalFactory, realtyFactory, wallet, compliance, aDocument };
});
