const express = require('express');

const router = express.Router();
const ethController = require('../../controllers/eth');
const mw = require('../../controllers/middleWares');

router.post('/decodeMnemonic', mw.infuraBaseUrl, ethController.decodeMnemonic);

module.exports = router;
