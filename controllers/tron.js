const cwr = require('../utils/createWebResp');
const fetch = require('node-fetch');

const getCheckNetworkStatus = async (req, res) => {
  try {
    const url = 'https://apilist.tronscan.org/api/system/status';
    const options = {
      method: 'GET',
    };

    const result = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getCheckNetworkStatus`,
      e.message,
    );
  }
};

const getLatestBlock = async (req, res) => {
  try {
    const url = 'https://apilist.tronscan.org/api/block/latest';
    const options = {
      method: 'GET',
    };

    const result = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - getLatestBlock`, e.message);
  }
};

const postFreeze = async (req, res) => {
  try {
    const {
      owner_address,
      frozen_duration,
      frozen_balance,
      receiver_address,
      resource,
    } = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/freezebalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        frozen_duration: frozen_duration,
        resource: resource,
        frozen_balance: frozen_balance,
        receiver_address: receiver_address,
      }),
    };

    const result = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postFreeze`, e.message);
  }
};

const postUnFreeze = async (req, res) => {
  try {
    const {owner_address, receiver_address, resource} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/unfreezebalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        resource: resource,
        receiver_address: receiver_address,
      }),
    };

    const result = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postUnFreeze`, e.message);
  }
};

const getListWitnesses = async (req, res) => {
  try {
    const url = 'https://api.shasta.trongrid.io/wallet/listwitnesses';
    const options = {method: 'GET'};

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - getListWitnesses`, e.message);
  }
};

const postGetReward = async (req, res) => {
  try {
    const {owner_address} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/getReward';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        address: owner_address,
        visible: false,
      }),
    };

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postGetReward`, e.message);
  }
};

const postVoteWitnessAccount = async (req, res) => {
  try {
    const {owner_address, votes} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/votewitnessaccount';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        votes: votes,
        /* votes example
          [
          {vote_address: '41e552f6487585c2b58bc2c9bb4492bc1f17132cd0', vote_count: 2},
          {vote_address: '41e552f6487585c2b58bc2c9bb4492bc1f17132cd0', vote_count: 1}
          ]
          */
      }),
    };

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postVoteWitnessAccount`,
      e.message,
    );
  }
};

const postWithdrawBalance = async (req, res) => {
  try {
    const {owner_address} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/withdrawbalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        visible: true,
      }),
    };

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postWithdrawBalance`, e.message);
  }
};

const getNextMaintenanceTime = async (req, res) => {
  try {
    const url = 'https://api.shasta.trongrid.io/wallet/getnextmaintenancetime';
    const options = {method: 'GET', headers: {Accept: 'application/json'}};

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getNextMaintenanceTime`,
      e.message,
    );
  }
};

const getTronPowerInfo = async (req, res) => {
  try {
    const url = 'https://api.shasta.trongrid.io/wallet/getnextmaintenancetime';
    const options = {method: 'GET', headers: {Accept: 'application/json'}};

    const result = fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - getTronPowerInfo`, e.message);
  }
};

const postSendTRX = async (req, res) => {
  try {
    const TronWeb = require('../../dist/TronWeb.node.js');

    const fullNode = 'https://api.shasta.trongrid.io';
    const solidityNode = 'https://api.shasta.trongrid.io';
    const eventServer = 'https://api.shasta.trongrid.io';
    const privateKey = '개인키';

    const app = async () => {
      const tronWeb = new TronWeb(
        fullNode,
        solidityNode,
        eventServer,
        privateKey,
      );
      tronWeb.setDefaultBlock('latest');

      const nodes = await tronWeb.isConnected();
      const connected = !Object.entries(nodes)
        .map(([name, connected]) => {
          if (!connected) console.error(`Error: ${name} is not connected`);
          return connected;
        })
        .includes(false);
      sendTransaction = await tronWeb.transactionBuilder.sendTrx(
        'TS4AYYxrF38EA3fDw92mMWbWdFWRJ4VKih',
        1000000,
      );

      const signedTransaction = await tronWeb.trx.sign(sendTransaction);
      console.group('Signed');
      console.log(
        '- Transaction:\n' + JSON.stringify(signedTransaction, null, 2),
        '\n',
      );
      console.groupEnd(); // no error {raw_data.data = 'hex_message'} Added

      const sendRaw = await tronWeb.trx.sendRawTransaction(signedTransaction); // error
      console.group('Success');
      console.log('- Transaction:\n' + JSON.stringify(sendRaw, null, 2), '\n');
      console.groupEnd();
    };
    app();
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postSendTRX`, e.message);
  }
};

module.exports = {
  postFreeze,
  postUnFreeze,
  getListWitnesses,
  postGetReward,
  postVoteWitnessAccount,
  postWithdrawBalance,
  getNextMaintenanceTime,
  getTronPowerInfo,
  postSendTRX,
};
