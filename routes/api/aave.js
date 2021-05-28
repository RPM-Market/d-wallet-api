const express = require('express');

const router = express.Router();
const aaveController = require('../../controllers/aave');
const mw = require('../../controllers/middleWares');

router.get("/test", mw.web3, mw.aaveNetwork, aaveController.test);

router.get("/balance", mw.web3, mw.aaveNetwork, aaveController.getBalance);

router.get("/availableStakingReward", mw.web3, mw.aaveNetwork, aaveController.getAvailableStakingReward);

router.post("/stake", mw.web3, mw.aaveNetwork, aaveController.postStake);

router.post("/claimRewards", mw.web3, mw.aaveNetwork, aaveController.postClaimRewards);

router.post("/redeem", mw.web3, mw.aaveNetwork, aaveController.postRedeem);

router.post("/cooldown", mw.web3, mw.aaveNetwork, aaveController.postCooldown);

module.exports = router;
