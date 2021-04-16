const cwr = require('../utils/createWebResp');
const tokenABI = require('../config/ETH/tokenABI');
const bip39 = require('bip39');
const ethers = require('ethers');
const eth = require('../config/ETH/eth');

const postDecodeMnemonic = async (req, res) => {
  try {
    const {mnemonic, index} = req.body;
    const path = eth.defaultWalletPath + index.toString();
    const mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    const body = {
      publicKey: mnemonicWallet.publicKey,
      privateKey: mnemonicWallet.privateKey,
      address: await mnemonicWallet.getAddress(),
      mnemonic: mnemonicWallet.mnemonic.phrase,
      id: mnemonicWallet.mnemonic.path,
      password: mnemonicWallet.mnemonic.password,
    };
    return cwr.createWebResp(res, 200, body);
  } catch (e) {
    return cwr.errorWebResp(res, 500, `E0000 - postDecodeMnemonic`, e.message);
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const {walletAddress, contractAddress} = req.query;
    const contract = new req.web3.eth.Contract(
      tokenABI.StandardABI,
      contractAddress,
    );
    let balance = await contract.methods.balanceOf(walletAddress).call();
    balance = req.web3.utils.fromWei(balance.toString(), 'ether');
    return cwr.createWebResp(res, 200, balance);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getTokenBalance', e.message);
  }
};

const getEtherBalance = async (req, res) => {
  try {
    const {walletAddress} = req.query;
    let balance = await req.web3.eth.getBalance(walletAddress);
    balance = req.web3.utils.fromWei(balance, 'ether');
    return cwr.createWebResp(res, 200, balance);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getEtherBalance', e.message);
  }
};

const postSendEther = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      toWalletAddress,
      amountEther,
      gasPrice,
      gasLimit,
    } = req.body;
    const nonce = await req.web3.eth.getTransactionCount(
      myWalletAddress,
      'pending',
    );
    const rawTx = {
      nonce: nonce,
      from: myWalletAddress,
      to: toWalletAddress,
      value: req.web3.utils.toHex(
        req.web3.utils.toWei(amountEther.toString(), 'ether'),
      ),
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'Gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
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
    return cwr.errorWebResp(res, 500, 'E0000 - postSendEther', e.message);
  }
};

const postSendToken = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      toWalletAddress,
      amountToken,
      gasPrice,
      gasLimit,
      contractAddress,
    } = req.body;
    const contract = new req.web3.eth.Contract(
      tokenABI.StandardABI,
      contractAddress,
    );
    let nonce = await req.web3.eth.getTransactionCount(
      myWalletAddress,
      'pending',
    );
    let contractRawTx = await contract.methods
      .transfer(
        toWalletAddress,
        req.web3.utils.toHex(
          req.web3.utils.toWei(amountToken.toString(), 'ether'),
        ),
      )
      .encodeABI();
    const rawTx = {
      nonce: req.web3.utils.toHex(nonce),
      gasLimit: req.web3.utils.toHex(gasLimit),
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      to: contractAddress,
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    const result = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, result);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postSendToken', e.message);
  }
};

const getGenerateMnemonic = async (req, res) => {
  try {
    const mnemonic = bip39.generateMnemonic();
    if (bip39.validateMnemonic(mnemonic)) {
      return cwr.createWebResp(res, 200, mnemonic);
    } else {
      return cwr.errorWebResp(
        res,
        500,
        'generateMnemonic error',
        '니모닉 발급 실패',
      );
    }
    return cwr.createWebResp(res, 200, true);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - GetGenerateMnemonic', e.message);
  }
};

const getValidateMnemonic = async (req, res) => {
  try {
    const {mnemonic} = req.query;
    let result = bip39.validateMnemonic(mnemonic);
    return cwr.createWebResp(res, 200, result);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - GetValidateMnemonic', e.message);
  }
};

const getCurrentGasPrice = async (req, res) => {
  try {
    let lastGasPrice = {};
    let blockNumber = await req.web3.eth.getBlockNumber();
    let getBlock = async () => {
      let i = 0;
      while (true) {
        let block = await req.web3.eth.getBlock(blockNumber - i);
        i = i + 1;
        if (block.transactions.length > 0) {
          return block;
        }
      }
    };
    let block = await getBlock();
    let txs = [];
    let txsGas = [];
    const chunkSize = block.transactions.length / 4;
    for (let txid = 0; txid < block.transactions.length; txid++) {
      txs.push(req.web3.eth.getTransaction(block.transactions[txid]));
    }

    const arrayToChunks = (array, chunkSize) => {
      const results = [];
      let start = 0;
      while (start < array.length) {
        results.push(array.slice(start, start + chunkSize));
        start += chunkSize;
      }
      return results;
    };

    const chunkedLinks = arrayToChunks(txs, chunkSize);
    for (let chunk of chunkedLinks) {
      const resolvedProducts = await Promise.all(chunk);
      resolvedProducts.forEach((product) => {
        txsGas.push(product.gas);
      });
    }
    let sumGas = txsGas.reduce((a, b) => a + b, 0);
    lastGasPrice.blockNumber = block.number;
    lastGasPrice.avg = sumGas / block.transactions.length;
    lastGasPrice.min = Math.min(...txsGas);
    lastGasPrice.max = Math.max(...txsGas);
    lastGasPrice.total = sumGas;
    lastGasPrice.transantionCount = block.transactions.length;
    return cwr.createWebResp(res, 200, lastGasPrice);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'test args error', e.message);
  }
};

module.exports = {
  postDecodeMnemonic,
  getEtherBalance,
  getTokenBalance,
  postSendEther,
  postSendToken,
  getGenerateMnemonic,
  getValidateMnemonic,
  getCurrentGasPrice,
};
