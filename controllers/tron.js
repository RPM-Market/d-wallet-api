const cwr = require('../utils/createWebResp');
const fetch = require('node-fetch');

// test
const test = async (req, res) => {
  try
  {
    const {owner_address, frozen_duration, frozen_balance, receiver_address, resource} = req.body;

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - test`, e.message);
  }
};

// check network status
const getCheckNetworkStatus = async (req, res) => {
  try
  {
    const url = 'https://apilist.tronscan.org/api/system/status';
    const options = {
      method: 'GET'
    };

    const result = await fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getCheckNetworkStatus`, e.message);
  }
};

// get latest block
const getLatestBlock = async (req, res) => {
  try
  {
    const url = 'https://apilist.tronscan.org/api/block/latest';
    const options = {
      method: 'GET'
    };

    const result = await fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getLatestBlock`, e.message);
  }
};

// 동결 - 투표권 얻기
const postFreeze = async (req, res) => {
  try
  {
    const {owner_address, frozen_duration, frozen_balance, receiver_address, resource} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/freezebalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        frozen_duration: frozen_duration,
        resource: resource,
        frozen_balance: frozen_balance,
        receiver_address: receiver_address
      })
    };

    const result = await fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postFreeze`, e.message);
  }
};

// 동결 해제
const postUnFreeze = async (req, res) => {
  try
  {
    const {owner_address, receiver_address, resource} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/unfreezebalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        resource: resource,
        receiver_address: receiver_address
      })
    };

    const result = await fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postUnFreeze`, e.message);
  }
};

// 검증자 리스트 불러오기
const getListWitnesses = async (req, res) => {
  try
  {
    const url = 'https://api.shasta.trongrid.io/wallet/listwitnesses';
    const options = {method: 'GET'};

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getListWitnesses`, e.message);
  }
};

// 리워드 받기
const postGetReward = async (req, res) => {
  try
  {
    const {owner_address} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/getReward';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        address: owner_address,
        visible: false
      })
    };

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postGetReward`, e.message);
  }
};

// 해당 검증자에게 투표하기
const postVoteWitnessAccount = async (req, res) => {
  try
  {
    const {owner_address, votes} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/votewitnessaccount';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        votes: votes
          /* votes example
          [
          {vote_address: '41e552f6487585c2b58bc2c9bb4492bc1f17132cd0', vote_count: 2},
          {vote_address: '41e552f6487585c2b58bc2c9bb4492bc1f17132cd0', vote_count: 1}
          ]
          */
      })
    };

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postVoteWitnessAccount`, e.message);
  }
};

// ??
const postWithdrawBalance = async (req, res) => {
  try
  {
    const {owner_address} = req.body;
    const url = 'https://api.shasta.trongrid.io/wallet/withdrawbalance';
    const options = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        owner_address: owner_address,
        visible: true
      })
    };

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));
    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postWithdrawBalance`, e.message);
  }
};

// ?? 다음 투표까지 남은 시간????
const getNextMaintenanceTime = async (req, res) => {
  try
  {
    const url = 'https://api.shasta.trongrid.io/wallet/getnextmaintenancetime';
    const options = {method: 'GET', headers: {Accept: 'application/json'}};

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getNextMaintenanceTime`, e.message);
  }
};

// 내 트론 에너지, 대역폭 조회하기
const getTronPowerInfo = async (req, res) => {
  try
  {
    const url = 'https://api.shasta.trongrid.io/wallet/getnextmaintenancetime';
    const options = {method: 'GET', headers: {Accept: 'application/json'}};

    const result = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

    return cwr.createWebResp(res, 200, true);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getTronPowerInfo`, e.message);
  }
};

// 트론 전송하기
const postSendTRX = async (req,res) => {
  try
  {
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
        privateKey
      );
      tronWeb.setDefaultBlock('latest');

      const nodes = await tronWeb.isConnected();
      const connected = !Object.entries(nodes).map(([name, connected]) => {
        if (!connected)
          console.error(`Error: ${name} is not connected`);
        return connected;
      }).includes(false);
      sendTransaction = await tronWeb.transactionBuilder.sendTrx('TS4AYYxrF38EA3fDw92mMWbWdFWRJ4VKih', 1000000);

      const signedTransaction = await tronWeb.trx.sign(sendTransaction);
      console.group('Signed');
      console.log('- Transaction:\n' + JSON.stringify(signedTransaction, null, 2), '\n');
      console.groupEnd(); // no error {raw_data.data = 'hex_message'} Added

      const sendRaw = await tronWeb.trx.sendRawTransaction(signedTransaction); // error
      console.group('Success');
      console.log('- Transaction:\n' + JSON.stringify(sendRaw, null, 2), '\n');
      console.groupEnd();

    };
    app();
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postSendTRX`, e.message);
  }
};


module.exports = {
  test,
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
