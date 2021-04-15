const express = require('express');

const router = express.Router();
const ethController = require('../../controllers/eth');
const mw = require('../../controllers/middleWares');

router.get('/etherBalance', mw.web3, ethController.getEtherBalance);

router.get('/tokenBalance', mw.web3, ethController.getTokenBalance);

router.post('/decodeMnemonic', ethController.postDecodeMnemonic);

router.post('/sendEther', mw.web3, ethController.postSendEther);

router.post('/sendToken', mw.web3, ethController.postSendToken);

module.exports = router;
