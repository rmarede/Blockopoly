const ethers = require('ethers');
const readline = require('readline');
const abiEncoder = require('./utils/abi-data-encoder');
const getAbi = require('./utils/get-abi');
const getAddress = require('./utils/get-address');

const PUBLIC_KEY_1 = '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73';
const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PUBLIC_KEY_2 = '0xFcCf97710dfdfBFe80ad627A6c10104A61b3C93C';
const PRIVATE_KEY_2 = '0x6c6fd860efa48e8f07e85482f06ddb6a989ac962dcb13f8d30fa85c104a0219b';
const PUBLIC_KEY_3 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
const PRIVATE_KEY_3 = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

const provider = new ethers.JsonRpcProvider("http://localhost:8500");
const wallet1 = new ethers.Wallet(PRIVATE_KEY_1, provider);
const signer1 = wallet1.connect(provider);
const wallet2 = new ethers.Wallet(PRIVATE_KEY_2, provider);
const signer2 = wallet2.connect(provider);

const Wallet = new ethers.Contract(getAddress.walletAddress(), getAbi.walletAbi(), provider);
const Realties = new ethers.Contract(getAddress.realtiesAddress(), getAbi.realtiesAbi(), provider);
const PermissionEndpoints = new ethers.Contract(getAddress.permissionEndpointsAddress(), getAbi.permissionEndpointsAbi(), provider);
const RentalAgreementFactory = new ethers.Contract(getAddress.rentalFactoryAddress(), getAbi.rentalFactoryAbi(), provider);
const SaleAgreementFactory = new ethers.Contract(getAddress.saleFactoryAddress(), getAbi.saleFactoryAbi(), provider);
const MortgageLoanFactory = new ethers.Contract(getAddress.mortgageFactoryAddress(), getAbi.mortgageFactoryAbi(), provider);

// ------------------------------------------------ PERMISSIONING ------------------------------------------------

async function addOrganization(signer, orgId, admin, perms) {
  const contract = PermissionEndpoints.connect(signer);
  return await contract.addOrganization(orgId, admin, [0,1,2,3,4,5,6,7]);
}

function encodeAddOrganization(orgId, admin, perms) {
  return abiEncoder.encodePermissionEndpointsData('addOrganization', [orgId, admin, perms]);
}

async function addRole(signer, roleId, privilege, perms) {
  const contract = PermissionEndpoints.connect(signer);
  return await contract.addRole(roleId, privilege, [0,1,2,3,4,5,6,7]);
}

async function addAccount(signer, accountAdress, role, isAdmin) {
  const contract = PermissionEndpoints.connect(signer);
  return await contract.addAccount(accountAdress, role, isAdmin);
}

async function addNode(signer, enodeId, id, port, raftPort) {
  const contract = PermissionEndpoints.connect(signer);
  return await contract.addNode(enodeId, id, port, raftPort);
}

// ------------------------------------------------ WALLET ------------------------------------------------

async function mintCurrency(signer, recipient, amount) {
  const contract = Wallet.connect(signer);
  return await contract.mint(recipient, amount);
}

async function balanceOf(signer, account) {
  const contract = Wallet.connect(signer);
  return await contract.balanceOf(account);
}

async function walletApprove(signer, spender, amount) {
  const contract = Wallet.connect(signer);
  return await contract.approve(spender, amount);
}

async function transfer(signer, recipient, amount) {
  const contract = Wallet.connect(signer);
  return await contract.transfer(recipient, amount);
}

// ------------------------------------------------ REALTY FACTORY ------------------------------------------------

async function mintRealty(signer, name, owners, shares) {
  const contract = Realties.connect(signer);
  return await contract.mint(name, "description123", owners, shares);
}

async function realtiesOf(signer, account) {
  const contract = Realties.connect(signer);
  return await contract.realtiesOf(account);
}

// ------------------------------------------------ OWNERSHIP ------------------------------------------------

async function ownershipApprove(signer, contractAddress, spender) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.approve(spender, tokenId);
}

async function submitTransaction(signer, contractAddress, destination, data) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.submitTransaction(destination, 0, data);
}

async function confirmTransaction(signer, contractAddress, transactionId) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.confirmTransaction(transactionId);
}

async function getParticipants(signer, contractAddress) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.getParticipants();
}

async function getTransactionCount(signer, contractAddress) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.transactionCount();
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

  const contract = SaleAgreementFactory.connect(signer);
  return await contract.createSaleAgreement(details);
}

async function submitSaleTransaction(signer, contractAddress, data) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  const contract = SaleAgreement.connect(signer);
  return await contract.submitTransaction(0, data);
}

async function confirmSaleTransaction(signer, contractAddress, transactionId) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  const contract = SaleAgreement.connect(signer);
  return await contract.confirmTransaction(transactionId);
}

async function getSaleTransactionCount(signer, contractAddress) {
  const SaleAgreement = new ethers.Contract(contractAddress, getAbi.saleAgreementAbi(), provider);
  const contract = SaleAgreement.connect(signer);
  return await contract.transactionCount();
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
  return abiEncoder.encodeRentalFactoryData('mintRentalAgreement', [tenant, terms]);
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
  const contract = MortgageLoanFactory.connect(signer);
  return await contract.createMortgageLoan(details);
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
  getTransactionCount: (signer, ...args) => getTransactionCount(signer, ...args)
};

rl.on('line', async (input) => {
  console.log(`You entered: ${input}`);
  const [command, ...args] = input.split(' ');

  const signer = args[0] === '1' ? signer1 : signer2;

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
