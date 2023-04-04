const Web3 = require('web3');
const URL_RPC = 'https://goerli.infura.io/v3/95936a3fcd954e49b767e82ef0574fd3';
const PASSWORD = 'XIEXUENI@XBANK.PLUS';
const web3 = new Web3(URL_RPC);
const FROM_ADDRESS = '0x0E717C91feA1FC992776d771383Dc0E217A986f2';
const TO_ADDRESS = '0xe5c70a775A9Cbc4B217a69EA4f4efa66F7F1c8FC';

module.exports = {
  PASSWORD,
  URL_RPC,
  web3,
  FROM_ADDRESS,
  TO_ADDRESS,
};
