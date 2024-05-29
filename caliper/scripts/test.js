const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8500'));
const functionEncoder = require('../scripts/abi-data-encoder');
const getAbi = require('../../besu/src/scripts/utils/get-abi');

const PUBLIC_KEY_1 = '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73';
const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PUBLIC_KEY_2 = '0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C';
const PRIVATE_KEY_2 = '0x6c6fd860efa48e8f07e85482f06ddb6a989ac962dcb13f8d30fa85c104a0219b';
const PUBLIC_KEY_3 = '0xC195057Fdd4eF1BB3022f5F1157D30b6468c84c8';
const PRIVATE_KEY_3 = '0x5d13d769309b9ab2de1cf46b1cb1f76ddea3702d285eb7deb77de225ac118240';
const PUBLIC_KEY_4 = '0xB0263c245533d3Eb188F6F6C57DF48C3B3f39631';
const PRIVATE_KEY_4 = '0x9d5876523ecdf5723f447f8049ff1492fdf83f1c0edd5770b4805fcfc67bd14d';

const account1 = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_1);
const account2 = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_2);
const account3 = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_3);
const account4 = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_4);

const contractAddress = "0xf17F9119A6e86e52318A6cAb90C8C219A9785247";

web3.eth.accounts.wallet.add(account1);
web3.eth.accounts.wallet.add(account2);
web3.eth.accounts.wallet.add(account3);
web3.eth.accounts.wallet.add(account4);

async function submit() {
  const SaleAgreement = new web3.eth.Contract(getAbi.saleAgreementAbi(), contractAddress);
  console.log(await SaleAgreement.methods.submitTransaction(0, functionEncoder.encodeSaleAgreementData('consent', [])).send({from: account1.address}));
}

submit();