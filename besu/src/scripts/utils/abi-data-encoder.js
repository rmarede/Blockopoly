const getAbi = require('./get-abi');

function encodeRentalAgreementData(functionToCall, params) {
    let RentalAgreementInterface = new ethers.Interface(getAbi.getRentalAgreementAbi());
    let data = RentalAgreementInterface.encodeFunctionData(functionToCall, params);
    return data;
}

function encodeOwnershipData(functionToCall, params) {
    let ownershipInterface = new ethers.Interface(getAbi.getOwnershipAbi());
    let data = ownershipInterface.encodeFunctionData(functionToCall, params);
    return data;
  }

module.exports = { encodeRentalAgreementData, encodeOwnershipData };