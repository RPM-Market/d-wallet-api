const StellarSdk = require('stellar-sdk');
const StellarHDWallet = require('stellar-hd-wallet');
const cwr = require('../utils/createWebResp');
const stellarConfig = require('../config/XLM/stellar');
const infura = require('../config/ETH/infura');

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
      // Asset need PublicAddress
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

// ETH
const infuraBaseUrl = async (req, res, next) => {
  try {
    const {endpoint} = req.body;
    req.baseUrl = infura.switchBaseUrl(endpoint);
    next();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - infuraBaseUrl`, e.message);
  }
};

module.exports = {
  isValidMnemonic,
  xlmNetwork,
  xlmAsset,
  infuraBaseUrl,
};
