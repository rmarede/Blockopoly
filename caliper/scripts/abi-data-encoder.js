const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const web3 = new Web3();
const ABIS_PATH = path.join(__dirname, '../deployment/abis.json');
let abis = JSON.parse(fs.readFileSync(ABIS_PATH, 'utf8'));


function encodeSaleAgreementData(functionToCall, params) {
  let data = web3.eth.abi.encodeFunctionCall(abis.saleAgreementAbi.find(method => method.name === functionToCall), params);
  console.log(JSON.stringify(abis.saleAgreementAbi.find(method => method.name === functionToCall)));
  return data;
}

function encodeOwnershipData(functionToCall, params) {
  let data = web3.eth.abi.encodeFunctionCall(abis.ownershipAbi.find(method => method.name === functionToCall), params);
  return data;
}

module.exports = { encodeOwnershipData, encodeSaleAgreementData };