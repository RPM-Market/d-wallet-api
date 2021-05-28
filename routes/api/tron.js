const express = require('express');
const router = express.Router();
const tronController = require('../../controllers/tron');
const mw = require('../../controllers/middleWares');

router.get('/test', tronController.test);

router.get('/listWitnesses', tronController.getListWitnesses);

router.get('/nextMaintenanceTime', tronController.getNextMaintenanceTime);

router.get('/tronPowerInfo', tronController.getTronPowerInfo);

router.post('/freeze', tronController.postFreeze);

router.post('/unFreeze', tronController.postUnFreeze);

router.post('/getReward', tronController.postGetReward);

router.post('/voteWitnessAccount', tronController.postVoteWitnessAccount);

router.post('/withdrawBalance', tronController.postWithdrawBalance);

router.post('/sendTRX', tronController.postSendTRX);

module.exports = router;
