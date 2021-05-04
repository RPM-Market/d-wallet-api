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
    const keyPair = hdMaster.derivePath(`m/44'/60'/0'/0/${index}`); // ("m/44'/0'/0'")
    // const p2pkh = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin})
    const address = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address;
    const pk = keyPair.toWIF();
    const privateKey = keyPair.privateKey.toString('hex').toString('base64');
    return cwr.createWebResp(res, 200, {address, pk, privateKey});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postDecodeMnemonic', e.message);
  }
};

const postWifToPublic = async (req, res) => {
  try {
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postWifToPublic', e.message);
  }
};

module.exports = {
  postTest,
  postDecodeMnemonic,
  postWifToPublic,
};
