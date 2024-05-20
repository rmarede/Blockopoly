const getAbi = require('./get-abi');

function encodeRentalAgreementData(functionToCall, params) {
    let interface = new ethers.Interface(getAbi.rentalAgreementAbi());
    let data = interface.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeSaleAgreementData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.saleAgreementAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeOwnershipData(functionToCall, params) {
    letinterface = new ethers.Interface(getAbi.ownershipAbi());
    let data = interface.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeWeightedMultiSigData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.weightedMultiSigAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeOrganizationVoterData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.organizationVoterAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeWalletData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.walletAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodePermissionEndpointsData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.permissionEndpointsAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeRentalFactoryData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.rentalFactoryAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}


module.exports = { encodeRentalAgreementData, encodeOwnershipData, encodeWeightedMultiSigData, encodeOrganizationVoterData, encodeWalletData, encodePermissionEndpointsData,
  encodeRentalFactoryData, encodeSaleAgreementData
};