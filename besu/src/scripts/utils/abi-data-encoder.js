const getAbi = require('./get-abi');

function encodeRentalAgreementData(functionToCall, params) {
    let interface = new ethers.Interface(getAbi.getRentalAgreementAbi());
    let data = interface.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeOwnershipData(functionToCall, params) {
    letinterface = new ethers.Interface(getAbi.getOwnershipAbi());
    let data = interface.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeWeightedMultiSigData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.getWeightedMultiSigAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeOrganizationVoterData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.getOrganizationVoterAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}

function encodeWalletData(functionToCall, params) {
  let interface = new ethers.Interface(getAbi.getWalletAbi());
  let data = interface.encodeFunctionData(functionToCall, params);
  return data;
}


module.exports = { encodeRentalAgreementData, encodeOwnershipData, encodeWeightedMultiSigData, encodeOrganizationVoterData, encodeWalletData };