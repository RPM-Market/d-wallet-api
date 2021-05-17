const cwr = require('../utils/createWebResp');
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

const postTest = async (req, res) => {
  try {
    // const keyPair = bitcoin.ECPair.makeRandom();
    // const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    // const pk = keyPair.toWIF();
    // return cwr.createWebResp(res, 200, {address, pk});
    return cwr.createWebResp(res, 200, {p2pkh, address});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postTest', e.message);
  }
};

const postDecodeMnemonic = async (req, res) => {
  try {
    const {mnemonic, index, network} = req.body;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    let bitcoinNetwork;
    if (network === 'bitcoin') {
      bitcoinNetwork = bitcoin.networks.bitcoin;
    } else if (network === 'testnet') {
      bitcoinNetwork = bitcoin.networks.testnet;
    } else if (network === 'regtest') {
      bitcoinNetwork = bitcoin.networks.regtest;
    }
    const hdMaster = bitcoin.bip32.fromSeed(seed, bitcoinNetwork); // bitcoin, testnet, regtest
    const path = `m/44'/0'/0'/0/${index}`;
    const keyPair = hdMaster.derivePath(path); // ("m/44'/0'/0'")
    // const p2pkh = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin})
    const address = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address;
    const privateKey = keyPair.toWIF();
    // const privateKey = keyPair.privateKey.toString('hex').toString('base64');
    return cwr.createWebResp(res, 200, {address, privateKey, path});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postDecodeMnemonic', e.message);
  }
};

// const postDecodeMnemonic = async (req, res) => {
//   try {
//     const {mnemonic, index, network} = req.body;
//     const seed = bip39.mnemonicToSeedSync(mnemonic);
//     let bitcoinNetwork;
//     if (network === 'bitcoin') {
//       bitcoinNetwork = bitcoin.networks.bitcoin;
//     } else if (network === 'testnet') {
//       bitcoinNetwork = bitcoin.networks.testnet;
//     } else if (network === 'regtest') {
//       bitcoinNetwork = bitcoin.networks.regtest;
//     }
//     const hdMaster = bitcoin.bip32.fromSeed(seed, bitcoinNetwork); // bitcoin, testnet, regtest
//     const keyPair = hdMaster.derivePath(`m/44'/0'/0'/0/${index}`); // ("m/44'/0'/0'")
//     // const p2pkh = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin})
//     const address = bitcoin.payments.p2pkh({
//       pubkey: keyPair.publicKey,
//       network: bitcoin.networks.bitcoin,
//     }).address;
//     const pk = keyPair.toWIF();
//     const privateKey = keyPair.privateKey.toString('hex').toString('base64');
//     return cwr.createWebResp(res, 200, {address, pk, privateKey});
//   } catch (e) {
//     return cwr.errorWebResp(res, 500, 'E0000 - postDecodeMnemonic', e.message);
//   }
// };

const postDecodeWIF = async (req, res) => {
  try {
    const {privateKey} = req.body;
    const keyPair = bitcoin.ECPair.fromWIF(privateKey);
    const {address: p2shPublicAddress} = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: bitcoin.networks.bitcoin,
      }),
    });
    const {address: p2pkhPublicAddress} = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    const data = {
      p2sh: {
        address: p2shPublicAddress,
      },
      p2pkh: {
        address: p2pkhPublicAddress,
      },
    };
    return cwr.createWebResp(res, 200, data);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postDecodeWIF', e.message);
  }
};

const postWifToPublic = async (req, res) => {
  try {
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postWifToPublic', e.message);
  }
};

const getBlockchainInfo = async (req, res) => {
  try {
    const client = req.client;
    const response = await client.getBlockchainInfo();
    return cwr.createWebResp(res, 200, {...response});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getBlockchainInfo', e.message);
  }
};

const getNetworkInfo = async (req, res) => {
  try {
    const client = req.client;
    const response = await client.getNetworkInfo();
    return cwr.createWebResp(res, 200, {...response});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getNetworkInfo', e.message);
  }
};

const postCreateWallet = async (req, res) => {
  try {
    const {network, client} = req;
    const {walletName} = req.body;
    let response;
    // mainnet doesn't make wallet in .bitcoin/wallets
    if (network === 'mainnet') {
      response = await client.createWallet(`wallets/${walletName}`);
    } else if (network === 'regtest') {
      response = await client.createWallet(`regtest/${walletName}`);
    } else if (network === 'testnet') {
      response = await client.createWallet(`testnet/${walletName}`);
    }
    return cwr.createWebResp(res, 200, {...response});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postCreateWallet', e.message);
  }
};

const getBalance = async (req, res) => {
  try {
    const client = req.client;
    const response = await client.getBalance('*', 6);
    return cwr.createWebResp(res, 200, {...response});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getBalance', e.message);
  }
};

const postLoadWallet = async (req, res) => {
  try {
    const client = req.client;
    const {walletName} = req.body;
    const response = await client.loadWallet(`${walletName}`);
    return cwr.createWebResp(res, 200, {...response});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postLoadWallet', e.message);
  }
};

module.exports = {
  postTest,
  postDecodeMnemonic,
  postDecodeWIF,
  postWifToPublic,
  getBlockchainInfo,
  getNetworkInfo,
  postCreateWallet,
  getBalance,
  postLoadWallet,
};
