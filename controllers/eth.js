const cwr = require('../utils/createWebResp');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const standard_abi = require('../config/ETH/StandardTokenABI');
const infura = require('../config/ETH/infura');
const bip39 = require('bip39');
const ethers = require('ethers');

const decodeMnemonic = async (req, res) => {
  try {
    const {mnemonic, index, numAddresses} = req.body;
    const baseUrl = req.baseUrl;
    const hdWallet = new HDWalletProvider(
      mnemonic,
      baseUrl + process.env.INFURA_PROJECT_SECRET,
      index,
      numAddresses,
    );
    let address = hdWallet.getAddress(index);
    return cwr.createWebResp(res, 200, address);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - decodeMnemonic`, e.message);
  }
};

module.exports = {
  decodeMnemonic,
};
