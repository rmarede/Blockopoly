const ethers = require('ethers');
const readline = require('readline');
const abiEncoder = require('./utils/abi-data-encoder');
const getAbi = require('./utils/get-abi');
const getAddress = require('./utils/get-address');

const PRIVATE_KEY_1 = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
const PRIVATE_KEY_2 = '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';

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
  await contract.addOrganization(orgId, admin, perms);
}

function encodeAddOrganization(orgId, admin, perms) {
  return abiEncoder.encodePermissionEndpointsData('addOrganization', [orgId, admin, perms]);
}

async function addRole(signer, roleId, privilege, perms) {
  const contract = PermissionEndpoints.connect(signer);
  await contract.addRole(roleId, privilege, perms);
}

async function addAccount(signer, accountAdress, role, isAdmin) {
  const contract = PermissionEndpoints.connect(signer);
  await contract.addAccount(accountAdress, role, isAdmin);
}

async function addNode(signer, enodeId, id, port, raftPort) {
  const contract = PermissionEndpoints.connect(signer);
  await contract.addNode(enodeId, id, port, raftPort);
}

// ------------------------------------------------ WALLET ------------------------------------------------

async function mintCurrency(signer, recipient, amount) {
  const contract = Wallet.connect(signer);
  await contract.mint(recipient, amount);
}

async function balanceOf(signer, account) {
  const contract = Wallet.connect(signer);
  return await contract.balanceOf(account);
}

async function approve(signer, spender, amount) {
  const contract = Wallet.connect(signer);
  await contract.approve(spender, amount);
}

// ------------------------------------------------ REALTY FACTORY ------------------------------------------------

async function mintRealty(signer, name, owners, shares) {
  const contract = Realties.connect(signer);
  await contract.mint(name, "description123", owners, shares);
}

async function realtiesOf(signer, account) {
  const contract = Realties.connect(signer);
  return await contract.realtiesOf(account);
}

// ------------------------------------------------ OWNERSHIP ------------------------------------------------

async function approve(signer, contractAddress, spender) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  await contract.approve(spender, tokenId);
}

async function submitTransaction(signer, contractAddress, destination, data) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  return await contract.submitTransaction(destination, 0, data);
}

async function confirmTransaction(signer, contractAddress, transactionId) {
  const Ownership = new ethers.Contract(contractAddress, getAbi.ownershipAbi(), provider);
  const contract = Ownership.connect(signer);
  await contract.confirmTransaction(transactionId);
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
    comission: commission,
    contengencyPeriod: contengencyPeriod,
    contengencyClauses: contengencyClauses
  }

  const contract = SaleAgreementFactory.connect(signer);
  await contract.createSaleAgreement(details);
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
  await contract.createMortgageLoan(details);
}



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Enter a command: <command> <signer(1/2)> <param1> <param2> ... (type "exit" to quit)');

rl.on('line', (input) => {
  console.log(`You entered: ${input}`);
  const [command, ...args] = input.split(' ');

  const signer = args[0] === '1' ? signer1 : signer2;
  
  switch (command) {
    case 'exit':
      rl.close();
      break;
    case 'mint20':
      mint20(args[1], signer);
      break;
    default:
      console.log(`Unknown command: ${command}`);
  }

  console.log('Enter a command: <command> <signer> <param1> <param2> ... (type "exit" to quit)');
});

rl.on('close', () => {
  process.exit(0);
});
