const express = require('express');

const router = express.Router();
const ethController = require('../../controllers/eth');
const mw = require('../../controllers/middleWares');

router.get('/etherBalance', mw.web3, ethController.getEtherBalance);

router.get('/tokenBalance', mw.web3, ethController.getTokenBalance);

router.post('/decodeMnemonic', mw.checkMnemonic, ethController.postDecodeMnemonic);

router.post('/sendEther', mw.web3, ethController.postSendEther);

router.post('/sendToken', mw.web3, ethController.postSendToken);

router.get('/generateMnemonic', ethController.getGenerateMnemonic);

router.get('/validateMnemonic', ethController.getValidateMnemonic);

router.get('/currentGasPrice', mw.web3, ethController.getCurrentGasPrice);

router.get('/currentGasPriceFromEthGasStation', ethController.getCurrentGasPriceFromEthGasStation);

router.get('/transactionListFromAddress', mw.etherscan, ethController.getTransactionListFromAddress);

router.get('/tokenTransactionListFromAddress', mw.etherscan, ethController.getTokenTransactionListFromAddress);

router.get('/transactionInfo', mw.web3, ethController.getTransactionInfo);

router.get('/blockInfo', mw.web3, ethController.getBlockInfo);

module.exports = router;
