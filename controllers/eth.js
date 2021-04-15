const cwr = require('../utils/createWebResp');
const Web3 = require('web3');
const standard_abi = require('../config/ETH/StandardTokenABI');
const infura = require('../config/ETH/infura');
const bip39 = require('bip39');
const ethers = require('ethers');

const postDecodeMnemonic = async (req, res) => {
  try {
    const {mnemonic, index} = req.body;

    if (index < 0 || index > 2147483647)
    {
      return cwr.errorWebResp(res, 500, `E0000 - index required (0 ~ 2147483647)`);
    }

    let path = "m/44'/60'/0'/0/" + index.toString();

    let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);

    let ret_json = {
      "publicKey": mnemonicWallet.publicKey,
      "privateKey": mnemonicWallet.privateKey,
      "address": await mnemonicWallet.getAddress(),
      "mnemonic": mnemonicWallet.mnemonic.phrase,
      "id": mnemonicWallet.mnemonic.path,
      "password": mnemonicWallet.mnemonic.password
    };

    console.log(ret_json);

    return cwr.createWebResp(res, 200, ret_json);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - decodeMnemonic`, e.message);
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const {walletAddress, contractAddress} = req.query;

    const contract = new req.web3.eth.Contract(standard_abi.human_standard_token_abi, contractAddress);

    let balance = await contract.methods.balanceOf(walletAddress).call();

    balance = req.web3.utils.fromWei(balance.toString(), 'ether');
    console.log(balance);

    return cwr.createWebResp(res, 200, balance);
  } catch (ex) {
    console.log(ex);
    return cwr.errorWebResp(res, 500, "E0000 - getEtherBalance", ex.message);
  }
};

const getEtherBalance = async (req, res) => {
  try {
    const {walletAddress} = req.query;

    let eth_bal = await req.web3.eth.getBalance(walletAddress);

    // 이더를 알맞은 단위로 조정한다.
    eth_bal = req.web3.utils.fromWei(eth_bal, "ether");

    console.log(eth_bal);

    return cwr.createWebResp(res, 200, eth_bal);
  } catch (ex) {
    console.log(ex);
    return cwr.errorWebResp(res, 500, "E0000 - getTokenBalance", ex.message);
  }
};

const postSendEther = async (req, res) => {
  try {
    const {myWalletAddress, myWalletPrivateKey, toWalletAddress, amountEther, gasPrice, gasLimit} = req.body;

    let nonce = await req.web3.eth.getTransactionCount(myWalletAddress, "pending");

    let txParam = {
      nonce: nonce,
      from: myWalletAddress,
      to: toWalletAddress,
      value: req.web3.utils.toHex(req.web3.utils.toWei(amountEther.toString(), 'ether')),
      gasPrice: req.web3.utils.toHex(req.web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
    };
    console.log(txParam);

    let account = req.web3.eth.accounts.privateKeyToAccount(myWalletPrivateKey);

    let signedTx = await account.signTransaction(txParam);

    let txInfo = await req.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("[log] tx send:", txInfo);

    return cwr.createWebResp(res, 200, txInfo);
  } catch (ex) {
    console.log(ex);
    return cwr.errorWebResp(res, 500, "E0000 - postSendEther", ex.message);
  }

};

const postSendToken = async (req, res) => {
  try {
    const {myWalletAddress, myWalletPrivateKey, toWalletAddress, amountToken, gasPrice, gasLimit, contractAddress} = req.body;

    const contract = new req.web3.eth.Contract(standard_abi.human_standard_token_abi, contractAddress);

    let eoa1_nonce = await req.web3.eth.getTransactionCount(myWalletAddress, "pending");

    let token_send_tx_data = await contract.methods.transfer(toWalletAddress, req.web3.utils.toHex(req.web3.utils.toWei(amountToken.toString(), 'ether'))).encodeABI();

    const rawTx = {
      nonce: req.web3.utils.toHex(eoa1_nonce),
      gasLimit: req.web3.utils.toHex(gasLimit), //web3.utils.toHex(config.ERC20.gasLimit),
      gasPrice: req.web3.utils.toHex(req.web3.utils.toWei(gasPrice.toString(), 'gwei')),
      to: contractAddress,
      from: myWalletAddress,
      data: token_send_tx_data,
      value: "0x0"
    };
    console.log(rawTx);

    let account = req.web3.eth.accounts.privateKeyToAccount(myWalletPrivateKey);

    let signedTx = await account.signTransaction(rawTx);

    let result = await req.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(result);

    return cwr.createWebResp(res, 200, result);
  } catch (ex) {
    console.log(ex);
    return cwr.errorWebResp(res, 500, "E0000 - postSendToken", ex.message);
  }

};


module.exports = {
  postDecodeMnemonic,
  getEtherBalance,
  getTokenBalance,
  postSendEther,
  postSendToken,
};
