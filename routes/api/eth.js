const express = require('express');

const router = express.Router();
const ethController = require('../../controllers/eth');
const mw = require('../../controllers/middleWares');

router.get('/etherBalance', mw.web3, ethController.getEtherBalance);

router.get('/tokenBalance', mw.web3, ethController.getTokenBalance);

router.post(
  '/decodeMnemonic',
  mw.checkMnemonic,
  ethController.postDecodeMnemonic,
);

router.post('/sendEther', mw.web3, ethController.postSendEther);

router.post('/sendToken', mw.web3, ethController.postSendToken);

router.post('/generateMnemonic', ethController.postGenerateMnemonic);

router.get('/validateMnemonic', ethController.getValidateMnemonic);

router.get('/gasPrice', mw.web3, ethController.getGasPrice);

router.get(
  '/gasPriceFromNet',
  ethController.getGasPriceFromNet,
);

router.get(
  '/txWithAddress',
  mw.etherscan,
  ethController.getTxWithAddress,
);

router.get(
  '/tokenTxWithAddress',
  mw.etherscan,
  ethController.getTokenTxWithAddress,
);

router.get('/tx', mw.web3, ethController.getTx);

router.get('/block', mw.web3, ethController.getBlock);

module.exports = router;
