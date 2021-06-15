const cwr = require('../utils/createWebResp');
const fetch = require('node-fetch');

// 잔액 조회
const getBalance = async (req, res) => {
  try
  {
    const {address} = req.query;
    const balance = await req.tronWeb.trx.getBalance(address);
    return cwr.createWebResp(res, 200, balance);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getBalance`, e.message);
  }
};

// 트론 보내기
const postSendTrx = async (req, res) => {
  try
  {
    const {myPrivateKey, toAddress, amount} = req.body;
    const txInfo = await req.tronWeb.trx.sendTransaction(toAddress, amount, myPrivateKey);
    return cwr.createWebResp(res, 200, txInfo);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postSendTRX`, e.message);
  }
};

// trx20 조회
const getTrcBalance = async (req, res) => {
  try
  {
    const {address} = req.query;
    const balance = await req.tronWeb.trx.getBalance(address);
    return cwr.createWebResp(res, 200, balance);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getBalance`, e.message);
  }
};

// trx20 보내기
const postSendTrc = async (req, res) => {
  try
  {
    const {myPrivateKey, toAddress, amount, tokenID} = req.body;
    const txInfo = await req.tronWeb.trx.sendToken(toAddress, amount, tokenID, myPrivateKey);
    return cwr.createWebResp(res, 200, txInfo);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postSendTRC`, e.message);
  }
};

// 니모닉 -> 주소 변환

// 에너지, 대역폭 조회
const getTronPowerInfo = async (req, res) => {
  try
  {
    const {address} = req.query;
    const bandwidth = await req.tronWeb.trx.getBandwidth(address);
    const energyFee = await req.tronWeb.trx.getEnergy(address);
    return cwr.createWebResp(res, 200, {bandwidth, energyFee});
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getTronPowerInfo`, e.message);
  }
};

// 프로징
const postFreeze = async (req, res) => {
  try
  {
    const {ownerAddress, duration, amount, receiverAddress, resource, options} = req.body;
    if (resource != "ENERGY" or resource != "BANDWIDTH")
    {
      return cwr.errorWebResp(res, 500, `E0000 - postFreeze`, "resource != \"\" or resource != \"\"");
    }
    const freezeTx = await tronWeb.transactionBuilder.freezeBalance(tronWeb.toSun(amount), duration, resource, ownerAddress, receiverAddress, options);
    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postFreeze`, e.message);
  }
};

// 투표
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
    const result = await fetch(url, options);
    const data = await result.json();
    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postVoteWitnessAccount`, e.message);
  }
};

// 리워드 받기
const postGetReward = async (req, res) => {
  try
  {
    /*
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
    const result = await fetch(url, options);
    const data = await result.json();
    return cwr.createWebResp(res, 200, data);
    */

    const {address} = req.body;
    const result = await req.tronWeb.trx.getReward(address);
    return cwr.createWebResp(res, 200, result);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postGetReward`, e.message);
  }
};

// 검증자 리스트 확인
const getListWitnesses = async (req, res) => {
  try
  {
    const SRList = await req.tronWeb.trx.listSuperRepresentatives();
    return cwr.createWebResp(res, 200, SRList);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getListWitnesses`, e.message);
  }
};

// 해동 - 언프리징
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
    const result = await fetch(url, options);
    const data = await result.json();
    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postUnFreeze`, e.message);
  }
};






// ------------------- 기타 -------------------
// 네트워크 status 조회
const getCheckNetworkStatus = async (req, res) => {
  try
  {
    const url = 'https://apilist.tronscan.org/api/system/status';
    const options = { method: 'GET' };
    const result = await fetch(url, options);
    const data = await result.json();
    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getCheckNetworkStatus`, e.message);
  }
};

// 최상위 블록 조회
const getLatestBlock = async (req, res) => {
  try
  {
    const url = 'https://apilist.tronscan.org/api/block/latest';
    const options = { method: 'GET' };
    const result = await fetch(url, options);
    const data = await result.json();
    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getLatestBlock`, e.message);
  }
};

// ???
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

    const result = await fetch(url, options);
    const data = await result.json();

    return cwr.createWebResp(res, 200, data);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - postWithdrawBalance`, e.message);
  }
};

// 다음 투표까지 남은 시간 조회
const getNextMaintenanceTime = async (req, res) => {
  try
  {
    const url = 'https://api.shasta.trongrid.io/wallet/getnextmaintenancetime';
    const options = {method: 'GET', headers: {Accept: 'application/json'}};
    const result = await fetch(url, options);
    const data = await result.json();
    const dateTime = new Date(data?.num);
    return cwr.createWebResp(res, 200, { dateTime, data });
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getNextMaintenanceTime`, e.message);
  }
};

// 계정 정보 조회
const getAccountInfo = async (req, res) => {
  try
  {
    const {address} = req.query;
    const accountInfo = await req.tronWeb.trx.getAccount(address);
    return cwr.createWebResp(res, 200, accountInfo);
  }
  catch (e)
  {
    return cwr.errorWebResp(res, 500, `E0000 - getAccountInfo`, e.message);
  }
};




module.exports = {
  getCheckNetworkStatus,
  getLatestBlock,
  getAccountInfo,
  postWithdrawBalance,
  getTronPowerInfo,

  getBalance,
  postSendTrx,
  getTrcBalance,
  postSendTrc,

  postFreeze,
  getListWitnesses,
  postVoteWitnessAccount,
  getNextMaintenanceTime,
  postGetReward,
  postUnFreeze,

};
