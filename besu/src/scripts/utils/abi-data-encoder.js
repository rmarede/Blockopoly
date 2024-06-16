const getAbi = require('./get-abi');
const ethers = require('ethers');

function encodeRentalAgreementData(functionToCall, params) {
    let itf = new ethers.Interface(getAbi.rentalAgreementAbi());
    let data = itf.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeSaleAgreementData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.saleAgreementAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeOwnershipData(functionToCall, params) {
    let itf = new ethers.Interface(getAbi.ownershipAbi());
    let data = itf.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeWeightedMultiSigData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.weightedMultiSigAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeOrganizationVoterData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.organizationVoterAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeWalletData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.walletAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}

function encodePermissionEndpointsData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.permissionEndpointsAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeRentalFactoryData(functionToCall, params) {
  let itf = new ethers.Interface(getAbi.rentalFactoryAbi());
  let data = itf.encodeFunctionData(functionToCall, params);
  return data;
}


module.exports = { encodeRentalAgreementData, encodeOwnershipData, encodeWeightedMultiSigData, encodeOrganizationVoterData, encodeWalletData, encodePermissionEndpointsData,
  encodeRentalFactoryData, encodeSaleAgreementData
};