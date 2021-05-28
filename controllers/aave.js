const cwr = require('../utils/createWebResp');
const tokenABI = require('../config/ETH/AaveTokenABI');
const StandardTokenABI = require('../config/ETH/StandardTokenABI');
const aave = require('../config/AAVE/aave');


const test = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
      contractAddress,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      contractAddress,
    );
    let COOLDOWN_SECONDS = await tokenContract.methods.COOLDOWN_SECONDS().call();
    let getTotalRewardsBalance = await tokenContract.methods.getTotalRewardsBalance(myWalletAddress).call();
    let stakersCooldowns = await tokenContract.methods.stakersCooldowns(myWalletAddress).call();

    return cwr.createWebResp(res, 200, {COOLDOWN_SECONDS, getTotalRewardsBalance, stakersCooldowns});
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - test`, e.message);
  }
};

const getBalance = async (req, res) => {
  try {
    const {address} = req.query;
    const contract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      req.tokenAddress,
    );
    const decimal = Math.pow(10, await contract.methods.decimals().call());
    const balance = (await contract.methods.balanceOf(address).call()) / decimal;
    const tokenName = await contract.methods.name().call();
    const tokenSymbol = await contract.methods.symbol().call();
    return cwr.createWebResp(res, 200, {balance, tokenName, tokenSymbol});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getBalance', e.message);
  }
};

const postStake = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      aave.addressSwitch[req.endpoint]["stkaave"],
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      aave.addressSwitch[req.endpoint]["stkaave"],
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .stake(myWalletAddress, req.web3.utils.toHex(totalAmount))
      .encodeABI();

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: aave.addressSwitch[req.endpoint]["stkaave"],
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postStake', e.message);
  }
};

const postClaimRewards = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      aave.addressSwitch[req.endpoint]["stkaave"],
    );
    let getTotalRewardsBalance = await tokenContract.methods.getTotalRewardsBalance(myWalletAddress).call();
    let claimRewards = await tokenContract.methods.claimRewards(myWalletAddress, getTotalRewardsBalance).encodeABI();

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: aave.addressSwitch[req.endpoint]["stkaave"],
      from: myWalletAddress,
      data: claimRewards,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, {getTotalRewardsBalance, txInfo});
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postClaimRewards`, e.message);
  }
};

const getAvailableStakingReward = async (req, res) => {
  try {
    const {
      myWalletAddress,
    } = req.query;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      aave.addressSwitch[req.endpoint]["stkaave"],
    );
    let getTotalRewardsBalance = await tokenContract.methods.getTotalRewardsBalance(myWalletAddress).call();
    return cwr.createWebResp(res, 200, req.web3.utils.fromWei(getTotalRewardsBalance.toString(), 'ether'));
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - getAvailableStakingReward`, e.message);
  }
};

const postRedeem = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
      contractAddress,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      contractAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      contractAddress,
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .redeem(myWalletAddress, req.web3.utils.toHex(totalAmount))
      .encodeABI();

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: contractAddress,
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postRedeem`, e.message);
  }
};

const postCooldown = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      gasPrice,
      gasLimit,
      contractAddress,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.AaveABI,
      contractAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      contractAddress,
    );


    let contractRawTx = await tokenContract.methods.cooldown().encodeABI();




    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: contractAddress,
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postCooldown`, e.message);
  }
};


/*
1. 잔액 조회
-- 전용 잔액 조회 일반 토큰/스테이킹 토큰 조회

2. 스테이킹
function stake(address onBehalfOf, uint256 amount) // (스테이킹 주소, 수량)

3. 리워드 측정, 받기
function claimRewards(address to, uint256 amount) // (리워드 받을 주소, 수량)

4. 언스테이킹 - 냉각타이머, 쿨다운 활성창, 환원
function redeem(address to, uint256 amount) // (환원받을 주소, 수량)
function cooldown() // 스테이킹 취소
function stakersCooldowns(address staker) view returns uint // (주소) => 해당 주소의 스테이킹을 동결함.
function COOLDOWN_SECONDS() view returns uint // 스테이킹을 취소하기 위해 최소 기다려야하는 시간 리턴.
function UNSTAKE_WINDOW() view returns uint
function getNextCooldownTimestamp(uint256 fromCooldownTimestamp, uint256 amountToReceive, address toAddress, uint256 toBalance) public returns (uint256)

etc1. 총 보상 확인.
function getTotalRewardsBalance(address staker) external view returns (uint256)

etc2. 리워드 계산.
emissionsPerSecond x seconds in a year / current stakes
https://docs.aave.com/developers/protocol-governance/staking-aave#calculating-apr-for-stkaave

 */


module.exports = {
  test,
  getBalance,
  postStake,
  postClaimRewards,
  postRedeem,
  getAvailableStakingReward,
  postCooldown,
};
