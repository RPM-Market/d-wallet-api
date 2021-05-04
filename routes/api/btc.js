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

router.post('/wifToPublic', btcController.postWifToPublic);

module.exports = router;
