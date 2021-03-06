const express = require('express');

const router = express.Router();
const atemController = require('../../controllers/atem');
const mw = require('../../controllers/middleWares');

router.get("/test", mw.web3, atemController.test);

router.get("/balance", mw.web3, atemController.getBalance);

router.post("/burn", mw.web3, atemController.postBurn);

router.post("/lock", mw.web3, atemController.postLock);

router.post("/unlock", mw.web3, atemController.postUnlock);

router.post("/timeLockList", mw.web3, atemController.getTimeLockList);

module.exports = router;
