const express = require('express');

const router = express.Router();
const btcController = require('../../controllers/btc');
const mw = require('../../controllers/middleWares');

router.post('/test', btcController.postTest);

router.post(
  '/decodeMnemonic',
  mw.checkMnemonic,
  btcController.postDecodeMnemonic,
);

router.post('/decodeWIF', btcController.postDecodeWIF);

router.post('/wifToPublic', btcController.postWifToPublic);

router.get('/blockchainInfo', mw.btcNetwork, btcController.getBlockchainInfo);

router.get('/networkInfo', mw.btcNetwork, btcController.getNetworkInfo);

router.post('/createWallet', mw.btcNetwork, btcController.postCreateWallet);

router.get('/balance', mw.btcNetwork, btcController.getBalance);

router.post('/loadWallet', mw.btcNetwork, btcController.postLoadWallet);

module.exports = router;
