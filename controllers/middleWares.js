const StellarSdk = require('stellar-sdk');
const StellarHDWallet = require('stellar-hd-wallet');
const cwr = require('../utils/createWebResp');
const stellarConfig = require('../config/XLM/stellar');
const eth = require('../config/ETH/eth');
const aave = require('../config/AAVE/aave');
const Web3 = require('web3');
const Client = require('bitcoin-core');
const { v1, v2, StakingInterface, TxBuilderV2, Network, Market } = require('@aave/protocol-js');

////////////////////// Middleware for XLM //////////////////////
const isValidMnemonic = async (req, res, next) => {
  try {
    if (!StellarHDWallet.validateMnemonic(req.body.mnemonic)) {
      return cwr.errorWebResp(res, 403, `Check Mnemonic`);
    }
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - isValidMnemonic`, e);
  }
};

const xlmNetwork = async (req, res, next) => {
  try {
    const network = req.query.network || req.body.network;
    if (!network) {
      return cwr.errorWebResp(res, 403, `E0000 - Empty Network`);
    }
    if (network === 'TESTNET') {
      // const serverUrl = 'https://horizon-testnet.stellar.org';
      const serverUrl = stellarConfig.testNetUrl;
      req.serverUrl = serverUrl;
      req.server = new StellarSdk.Server(serverUrl, {allowHttp: true});
      req.networkPassphrase = StellarSdk.Networks.TESTNET;
    } else if (network === 'PUBLIC') {
      // const serverUrl = 'https://horizon.stellar.org';
      const serverUrl = stellarConfig.publicUrl;
      req.serverUrl = serverUrl;
      req.server = new StellarSdk.Server(serverUrl, {allowHttp: true});
      req.networkPassphrase = StellarSdk.Networks.PUBLIC;
    } else {
      return cwr.errorWebResp(res, 403, `E0000 - Invalid Network`);
    }
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - xlmNetwork`, e.message);
  }
};

const xlmAsset = async (req, res, next) => {
  try {
    const asset = req.query.asset?.toString() || req.body.asset?.toString();
    const assetPub =
      req.query.assetPub?.toString() || req.body.assetPub?.toString();
    if (asset === 'native') {
      // Native(XLM)
      req.asset = StellarSdk.Asset.native();
    } else if (!asset || !assetPub) {
      // Asset needs PublicAddress
      return cwr.errorWebResp(res, 403, `E0000 - Need asset & assetPub`);
    } else if (asset && assetPub) {
      req.asset = new StellarSdk.Asset(asset, assetPub);
    } else {
      return cwr.errorWebResp(res, 403, `E0000 - check error...`);
    }
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - xlmAsset`, e.message);
  }
};

////////////////////// Middleware for ETH //////////////////////
const web3 = async (req, res, next) => {
  try {
    req.endpoint = req.body.endpoint?.trim() || req.query.endpoint?.trim();
    req.baseUrl = eth.switchBaseUrl(req.endpoint);
    req.httpProvider = new Web3.providers.HttpProvider(req.baseUrl + process.env.INFURA_PROJECT_ID);
    req.web3 = new Web3(req.httpProvider);
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - infuraBaseUrl`, e.message);
  }
};

const checkMnemonic = async (req, res, next) => {
  try {
    const index = req.body.index || req.query.index;
    if (index < eth.minIDValue || index > eth.maxIDValue) {
      return cwr.errorWebResp(
        res,
        500,
        `E0000 - index required (0 ~ 2147483647)`,
      );
    }
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - checkMnemonic`, e.message);
  }
};

const checkBTCNetwork = async (req, res, next) => {
  try {
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - checkBTCNetwork`, e.message);
  }
};

const etherscan = async (req, res, next) => {
  try {
    const endpoint = req.body.endpoint?.trim() || req.query.endpoint?.trim();
    req.etherscan = require('etherscan-api').init(
      process.env.ETHERSCAN_API_KEY,
      endpoint,
    );
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - infuraBaseUrl`, e.message);
  }
};

////////////////////// Middleware for BTC //////////////////////
const btcNetwork = async (req, res, next) => {
  try {
    const network = req.body.network || req.query.network;
    let client;
    // network param must be 'bitcoin' or 'mainnet'
    if (network === 'bitcoin' || network === 'mainnet') {
      client = new Client({
        network,
        host: process.env.BTC_HOST,
        username: process.env.BTC_USERNAME,
        password: process.env.BTC_USER_PASSWORD,
        port: process.env.BTC_MAINNET_PORT,
      });
    } else if (network === 'testnet') {
      client = new Client({
        network,
        host: process.env.BTC_HOST,
        username: process.env.BTC_USERNAME,
        password: process.env.BTC_USER_PASSWORD,
        port: process.env.BTC_TESTNET_PORT,
      });
    } else if (network === 'regtest') {
      client = new Client({
        network,
        host: process.env.BTC_HOST,
        username: process.env.BTC_USERNAME,
        password: process.env.BTC_USER_PASSWORD,
        port: process.env.BTC_REGTEST_PORT,
      });
    } else {
      return cwr.errorWebResp(
        res,
        500,
        `E0000 - Check Network, network should be 'bitcoin / mainnet / testnet / regtest`,
      );
    }
    req.client = client;
    req.network = network;
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - btcNetwork`, e.message);
  }
};

<<<<<<< HEAD
////////////////////// Middleware for Aave //////////////////////
const aaveNetwork = async (req, res, next) => {
  try {
    const {stake} = req.query;

    req.tokenAddress = aave.addressSwitch[req.endpoint][stake];
/*
    if (stake === "false")
    {
      if (req.endpoint === "mainnet")
      {
        req.tokenAddress = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
      }
      else if (req.endpoint === "kovan")
      {
        req.tokenAddress = "0xb597cd8d3217ea6477232f9217fa70837ff667af";
      }
    }
    else if (stake === "true")
    {
      if (req.endpoint === "mainnet")
      {
        req.tokenAddress = "0x4da27a545c0c5B758a6BA100e3a049001de870f5";
      }
      else if (req.endpoint === "kovan")
      {
        req.tokenAddress = "0xf2fbf9a6710afda1c4aab2e922de9d69e0c97fd2";
      }
    }
    else
    {
      return cwr.errorWebResp(res, 500, `E0000 - aaveNetwork`, "invaild stake");
    }
*/


    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - aaveNetwork`, e.message);
=======
const btcLastBlockHash = async (req, res, next) => {
  try {
    const client = req.client;
    const response = await client.getBlockchainInfo();
    const lastBlockHash = response.bestblockhash;
    const lastBlockNumber = response.blocks;
    req.lastBlockHash = lastBlockHash;
    req.lastBlockNumber = lastBlockNumber;
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - btcLastBlockHash`, e.message);
>>>>>>> 1f9d906b47da6298d76371f4e752e24b156c0195
  }
};

module.exports = {
  isValidMnemonic,
  xlmNetwork,
  xlmAsset,
  web3,
  checkMnemonic,
  checkBTCNetwork,
  etherscan,
  btcNetwork,
<<<<<<< HEAD
  aaveNetwork,
=======
  btcLastBlockHash,
>>>>>>> 1f9d906b47da6298d76371f4e752e24b156c0195
};
