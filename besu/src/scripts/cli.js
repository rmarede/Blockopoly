const ethers = require('ethers');
const readline = require('readline');
const abiEncoder = require('./utils/abi-data-encoder');
const getAbi = require('./utils/get-abi');
const getAddress = require('./utils/get-address');

const PUBLIC_KEY_1 = '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73';
const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PUBLIC_KEY_2 = '0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C';
const PRIVATE_KEY_2 = '0x6c6fd860efa48e8f07e85482f06ddb6a989ac962dcb13f8d30fa85c104a0219b';
const PUBLIC_KEY_3 = '0xC195057Fdd4eF1BB3022f5F1157D30b6468c84c8';
const PRIVATE_KEY_3 = '0x5d13d769309b9ab2de1cf46b1cb1f76ddea3702d285eb7deb77de225ac118240';
const PUBLIC_KEY_4 = '0xB0263c245533d3Eb188F6F6C57DF48C3B3f39631';
const PRIVATE_KEY_4 = '0x9d5876523ecdf5723f447f8049ff1492fdf83f1c0edd5770b4805fcfc67bd14d';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet1 = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer1 = wallet1.connect(provider);
const wallet2 = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer2 = wallet2.connect(provider);
const wallet3 = new ethers.Wallet(PRIVATE_KEY_3, provider);
const signer3 = wallet3.connect(provider);
const wallet4 = new ethers.Wallet(PRIVATE_KEY_4, provider);
const signer4 = wallet4.connect(provider);

const Wallet = new ethers.Contract(getAddress.walletAddress(), getAbi.walletAbi(), provider);
const RealtyFactory = new ethers.Contract(getAddress.realtyFactoryAddress(), getAbi.realtyFactoryAbi(), provider);
const PermissionEndpoints = new ethers.Contract(getAddress.permissionEndpointsAddress(), getAbi.permissionEndpointsAbi(), provider);
const RentalAgreementFactory = new ethers.Contract(getAddress.rentalFactoryAddress(), getAbi.rentalFactoryAbi(), provider);
const SaleAgreementFactory = new ethers.Contract(getAddress.saleFactoryAddress(), getAbi.saleFactoryAbi(), provider);
const MortgageLoanFactory = new ethers.Contract(getAddress.mortgageFactoryAddress(), getAbi.mortgageFactoryAbi(), provider);

// ------------------------------------------------ PERMISSIONING ------------------------------------------------

async function addOrganization(signer, orgId, admin, perms) {
  return await PermissionEndpoints.connect(signer).addOrganization(orgId, admin, [0,1,2,3,4,5,6,7]);
}

function encodeAddOrganization(orgId, admin, perms) {
  return abiEncoder.encodePermissionEndpointsData('addOrganization', [orgId, admin, perms]);
}

async function addRole(signer, roleId, privilege, perms) {
  return await PermissionEndpoints.connect(signer).addRole(roleId, privilege, [0,1,2,3,4,5,6,7]);
}

async function addAccount(signer, accountAdress, role, isAdmin) {
  return await PermissionEndpoints.connect(signer).addAccount(accountAdress, role, isAdmin);
}

async function addNode(signer, enodeId, id, port, raftPort) {
  return await PermissionEndpoints.connect(signer).addNode(enodeId, id, port, raftPort);
}

// ------------------------------------------------ WALLET ------------------------------------------------

async function mintCurrency(signer, recipient, amount) {
  return await Wallet.connect(signer).mint(recipient, amount);
}

async function balanceOf(signer, account) {
  return await Wallet.connect(signer).balanceOf(account);
}

async function walletApprove(signer, spender, amount) {
  return await Wallet.connect(signer).approve(spender, amount);
}

async function allowance(signer, owner, spender) {
  return await Wallet.connect(signer).allowance(owner, spender);
}

async function transfer(signer, recipient, amount) {
  return await Wallet.connect(signer).transfer(recipient, amount);
}

// ------------------------------------------------ REALTY FACTORY ------------------------------------------------

async function mintRealty(signer, name, owners, shares) {

  const details = {
    name: name,
    ownership: PUBLIC_KEY_1,
    kind: "house",
    district: "lisbon",
    location: "central route",
    image: "image",
    totalArea: 100
    }

  return await RealtyFactory.connect(signer).mint(details, owners, shares);
}

async function realtiesOf(signer, account) {
  return await RealtyFactory.connect(signer).getRealtiesOf(account);
}

// ------------------------------------------------ OWNERSHIP ------------------------------------------------

async function sharesOf(signer, contractAddress, account) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).shareOf(account);
}

async function ownershipApprove(signer, contractAddress, spender) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).approve(spender, tokenId);
}

async function approvedOf(signer, contractAddress, account) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).approvedOf(account);
}

async function submitTransaction(signer, contractAddress, destination, data) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).submitTransaction(destination, 0, data);
}

async function confirmTransaction(signer, contractAddress, transactionId) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).confirmTransaction(transactionId);
}

async function getParticipants(signer, contractAddress) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).getParticipants();
}

async function getTransactionCount(signer, contractAddress) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  return await Ownership.connect(signer).transactionCount();
}

// ------------------------------------------------ SALE AGREEMENTS ------------------------------------------------

async function mintSaleAgreement(signer, buyer, seller, realty, share, price, earnest, realtor, comission, contengencyPeriod, contengencyClauses) {
  const details = {
    buyer: buyer,
    seller: seller,
    realty: realty,
    share: share,
    price: price,
    earnest: earnest,
    realtor: realtor,
    comission: comission,
    contengencyPeriod: contengencyPeriod,
    contengencyClauses: contengencyClauses
  }

  return await SaleAgreementFactory.connect(signer).createSaleAgreement(details);
}

async function salesOf(signer, account) {
  return await SaleAgreementFactory.connect(signer).getSalesOf(account);
}

async function submitSaleTransaction(signer, contractAddress, data) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  return await SaleAgreement.connect(signer).submitTransaction(0, data);
}

async function confirmSaleTransaction(signer, contractAddress, transactionId) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  return await SaleAgreement.connect(signer).confirmTransaction(transactionId);
}

async function getSaleTransactionCount(signer, contractAddress) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  return await SaleAgreement.connect(signer).transactionCount();
}

function consentData() {
  return abiEncoder.encodeSaleAgreementData('consent', []);
}

function commitData() {
  return abiEncoder.encodeSaleAgreementData('commit', []);
}

function withdrawData(penalty) {
  return abiEncoder.encodeSaleAgreementData('withdraw', [penalty]);
}


// ------------------------------------------------ RENTAL AGREEMENTS ------------------------------------------------

function encodeMintRentalAgreement(tenant, realty, startDate, duration, rentValue, securityDeposit, securityReturnDueDate, 
  paymentDueDate, latePaymentFee, earlyTerminationFee, earlyTerminationNotice, extra) {

  const terms = {
    realtyContract: realty,
    startDate: startDate,
    duration: duration, 
    rentValue: rentValue,
    securityDeposit: securityDeposit,
    securityReturnDueDate: securityReturnDueDate,
    paymentDueDate: paymentDueDate,
    latePaymentFee: latePaymentFee,
    earlyTerminationFee: earlyTerminationFee, 
    earlyTerminationNotice: earlyTerminationNotice,
    extra: extra, 
    payees: [], 
    shares: []
  };
  return abiEncoder.encodeRentalFactoryData('createRentalAgreement', [tenant, terms]);
}

// ------------------------------------------------ MORTGAGE LOANS ------------------------------------------------

async function mintMortgageLoan(signer, borrower, principal, downPayment, interestRate, loanTerm, startDate, gracePeriod, latePaymentFee, defaultDeadline) {
  const details = {
    lender: signer,
    borrower: borrower,
    principal: principal,
    downPayment: downPayment,  
    interestRate: interestRate, 
    loanTerm: loanTerm, 
    startDate: startDate,
    gracePeriod: gracePeriod, 
    latePaymentFee: latePaymentFee, 
    defaultDeadline: defaultDeadline
  };
  return await MortgageLoanFactory.connect(signer).createMortgageLoan(details);
}



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Enter a command: <command> <signer(1/2)> <param1> <param2> ... (type "exit" to quit)');

const commands = {
  addOrganization: (signer, ...args) => addOrganization(signer, ...args),
  addRole: (signer, ...args) => addRole(signer, ...args),
  addAccount: (signer, ...args) => addAccount(signer, ...args),
  addNode: (signer, ...args) => addNode(signer, ...args),
  mintCurrency: (signer, ...args) => mintCurrency(signer, ...args),
  balanceOf: (signer, ...args) => balanceOf(signer, ...args),
  walletApprove: (signer, ...args) => walletApprove(signer, ...args),
  transfer: (signer, ...args) => transfer(signer, ...args),
  mintRealty: (signer, ...args) => mintRealty(signer, ...args),
  realtiesOf: (signer, ...args) => realtiesOf(signer, ...args),
  ownershipApprove: (signer, ...args) => ownershipApprove(signer, ...args),
  mintSaleAgreement: (signer, ...args) => mintSaleAgreement(signer, ...args),
  submitSaleTransaction: (signer, ...args) => submitSaleTransaction(signer, ...args),
  confirmSaleTransaction: (signer, ...args) => confirmSaleTransaction(signer, ...args),
  getSaleTransactionCount: (signer, ...args) => getSaleTransactionCount(signer, ...args),
  mintMortgageLoan: (signer, ...args) => mintMortgageLoan(...args),
  //mintRentalAgreement: (signer, ...args) => submitTransaction(signer, encodeMintRentalAgreement(signer, ...args)),
  submitConsent: (signer, ...args) => submitSaleTransaction(signer, ...args, consentData()),
  submitConsent: (signer, ...args) => submitSaleTransaction(signer, ...args, commitData()),
  //submitWithdraw: (signer, ...args) => withdrawData(signer, ...args),
  submitTransaction: (signer, ...args) => submitTransaction(signer, ...args),
  confirmTransaction: (signer, ...args) => confirmTransaction(signer, ...args),
  getParticipants: (signer, ...args) => getParticipants(signer, ...args),
  getTransactionCount: (signer, ...args) => getTransactionCount(signer, ...args),
  salesOf: (signer, ...args) => salesOf(signer, ...args),
  sharesOf: (signer, ...args) => sharesOf(signer, ...args),
  approvedOf: (signer, ...args) => approvedOf(signer, ...args),
  allowance: (signer, ...args) => allowance(signer, ...args),
};

rl.on('line', async (input) => {
  console.log(`You entered: ${input}`);
  const [command, ...args] = input.split(' ');

  let signer = signer1;
  signer = args[0] === '2' ? signer2 : signer;
  signer = args[0] === '3' ? signer3 : signer;
  signer = args[0] === '4' ? signer4 : signer;

  if (command in commands) {
    try {
      console.log(await commands[command](signer, ...args.slice(1)));
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
    console.log('\n\nEnter a command: <command> <signer> <param1> <param2> ... (type "exit" to quit)');
  } else if (command === 'exit') {
    rl.close();
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('\n\nEnter a command: <command> <signer> <param1> <param2> ... (type "exit" to quit)');
  }

});
