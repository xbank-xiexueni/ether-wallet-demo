/**
 * # Demo
 * 以下需要在 demo 中体现：
 *
 * ## 私钥、公钥
 * - binary 形式
 * - hex 形式
 * - 助记词形式
 *
 * ## 地址
 * - base58 形式
 * - hex 形式
 *
 * ## 构造交易
 * - 普通转账
 * - 调用合约
 *
 * ## 交易序列化
 * - tx hash/tx id
 *
 * ## 交易签名、消息签名
 *
 * ## 广播交易
 */
const dotenv = require('dotenv');
dotenv.config();
const { generateMnemonic, mnemonicToSeedSync } = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const util = require('ethereumjs-util');
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');

const { PASSWORD, FROM_ADDRESS, TO_ADDRESS, URL_RPC } = process.env;

const web3 = new Web3(URL_RPC);
const createAccount = async () => {
  // 1. generate mnemonic
  const mnemonic = generateMnemonic();

  // 2. mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic, PASSWORD);

  // 3. seed to HD Wallet
  const hdWallet = hdkey.fromMasterSeed(seed);

  // 4. m/44'/60'/0'/0/0 keypair ???
  const key = hdWallet.derivePath("m/44'/60'/0'/0/0");

  // 5. keypair to private key
  const privateKey = util.bufferToHex(key._hdkey._privateKey);

  // 6. keypair to public key
  const publicKey = util.bufferToHex(key._hdkey._publicKey);

  // 7. public key to address(buffer)
  const addressBuffer = util.pubToAddress(key._hdkey._publicKey, true);
  const hexAddress = util.toChecksumAddress(
    '0x' + addressBuffer.toString('hex')
  );

  // 8. private key & user's password to keystore
  const keystore = web3.eth.accounts.encrypt(privateKey, PASSWORD);

  return {
    address: hexAddress,
    privateKey,
    publicKey,
    mnemonic,
    keystore,
  };
};

const importAccountByPrivateKey = (privatekey) => {
  const account = web3.eth.accounts.privateKeyToAccount(privatekey);
  return account;
};

const importAccountByKeystoreAndPassword = (keystoreData, password) => {
  const account = web3.eth.accounts.decrypt(JSON.parse(keystoreData), password);
  return account;
};

const importAccountByMnemonic = (mnemonic) => {
  /**
   * use m/44'/60'/0'/0/0
   * actually need to forEach ["m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1","m/44'/60'/0'/0/2",...]
   */
  // 1. mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic, PASSWORD);
  // 2. seed to HDWallet
  const hdWallet = hdkey.fromMasterSeed(seed);
  // for (let i = 0; i < 100; i++) {
  // 3. get the first account's keypair
  const key = hdWallet.derivePath("m/44'/60'/0'/0/0");
  // 4. get private key
  const privatekey = util.bufferToHex(key._hdkey._privateKey);
  // 5. private key to address
  const account = web3.eth.accounts.privateKeyToAccount(privatekey);

  return account;
  // }
};

const sendTransaction = async (
  from = FROM_ADDRESS,
  to = TO_ADDRESS,
  number = '0.0001',
  privateKey
) => {
  const nonce = await web3.eth.getTransactionCount(from);
  console.log('🚀 ~ file: index.js:105 ~ nonce:', nonce);
  const gasPrice = await web3.eth.getGasPrice();
  console.log('🚀 ~ file: index.js:107 ~ gasPrice:', gasPrice);
  const balance = await web3.utils.toWei(number);
  console.log('🚀 ~ file: index.js:109 ~ balance:', balance);

  const rawTx = {
    nonce: nonce,
    gasPrice: gasPrice,
    to,
    value: balance,
    data: '0x00', // Token
  };
  // estimate Gas
  const gas = await web3.eth.estimateGas(rawTx);
  rawTx.gas = gas;
  console.log('🚀 ~ file: index.js:123 ~ rawTx:', rawTx);

  const tx = new Tx(rawTx);
  console.log('🚀 ~ file: index.js:126 ~ tx:', tx);
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  tx.sign(privateKeyBuffer);
  console.log('🚀 ~ file: index.js:129 ~ tx:', tx);

  const serializedTx = tx.serialize();
  console.log('🚀 ~ file: index.js:132 ~ serializedTx:', serializedTx);
  await web3.eth
    .sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, data) => {
      console.log(err, 'error');
      console.log(data, 'data');

      if (err) {
        console.log('🚀 ~ file: index.js:129 ~ sendTransaction ~ err:', err);
      }
    })
    .then((data) => {
      console.log(data), 'then data';
      if (data) {
        console.log('🚀 ~ file: index.js:145 ~ .then ~ data:', data);
      } else {
        console.log('transaction failed');
      }
    });
};

const main = async () => {
  sendTransaction();
  return;
  const { address, privateKey, mnemonic, publicKey, keystore } =
    await createAccount();

  // check importAccountByPrivateKey
  console.log(importAccountByPrivateKey(privateKey).address === address);
  // check importAccountByKeystoreAndPassword
  console.log(
    importAccountByKeystoreAndPassword(JSON.stringify(keystore), PASSWORD)
      .address === address
  );
  // check importAccountByMnemonic
  console.log(importAccountByMnemonic(mnemonic).address === address);
};

main();
