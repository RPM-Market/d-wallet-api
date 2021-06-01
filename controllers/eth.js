const cwr = require('../utils/createWebResp');
const tokenABI = require('../config/ETH/StandardTokenABI');
const bip39 = require('bip39');
const ethers = require('ethers');
const eth = require('../config/ETH/eth');
const axios = require('axios');

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
    const decimal = Math.pow(10, await contract.methods.decimals().call());
    const balance =
      (await contract.methods.balanceOf(walletAddress).call()) / decimal;
    const tokenName = await contract.methods.name().call();
    const tokenSymbol = await contract.methods.symbol().call();
    return cwr.createWebResp(res, 200, {balance, tokenName, tokenSymbol});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getTokenBalance', e.message);
  }
};

const getEtherBalance = async (req, res) => {
  try {
    const {walletAddress} = req.query;
    let balance = await req.web3.eth.getBalance(walletAddress);
    balance = req.web3.utils.fromWei(balance, 'ether');
    return cwr.createWebResp(res, 200, {balance});
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

    const rawTx = {
      from: myWalletAddress,
      to: toWalletAddress,
      value: req.web3.utils.toHex(
        req.web3.utils.toWei(amountEther.toString(), 'ether'),
      ),
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
    };

    const account =
      req.web3.eth.accounts.privateKeyToAccount(myWalletPrivateKey);
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
    const decimal = Math.pow(10, await contract.methods.decimals().call());
    const totalAmount = (decimal * amountToken).toLocaleString('fullwide', {
      useGrouping: false,
    });
    const contractRawTx = await contract.methods
      .transfer(toWalletAddress, req.web3.utils.toHex(totalAmount))
      .encodeABI();

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: contractAddress,
      from: myWalletAddress,
      value: '0x0',

      data: contractRawTx,
    };
    const account =
      req.web3.eth.accounts.privateKeyToAccount(myWalletPrivateKey);
    const signedTx = await account.signTransaction(rawTx);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postSendToken', e.message);
  }
};

const postGenerateMnemonic = async (req, res) => {
  try {
    const mnemonic = bip39.generateMnemonic();
    if (bip39.validateMnemonic(mnemonic)) {
      return cwr.createWebResp(res, 200, {mnemonic});
    }
    return cwr.errorWebResp(
      res,
      500,
      'generateMnemonic error',
      '니모닉 발급 실패',
    );
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      'E0000 - postGenerateMnemonic',
      e.message,
    );
  }
};

const getValidateMnemonic = async (req, res) => {
  try {
    const {mnemonic} = req.query;
    const result = bip39.validateMnemonic(mnemonic);
    return cwr.createWebResp(res, 200, result);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - GetValidateMnemonic', e.message);
  }
};

const getGasPrice = async (req, res) => {
  try {
    let lastGasPrice = {};
    let blockNumber = await req.web3.eth.getBlockNumber();
    let getBlock = async () => {
      let i = 0;
      while (true) {
        if (blockNumber - i < 1) {
          throw 'end block number';
        }
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
    const chunkSize =
      block.transactions.length / Math.sqrt(block.transactions.length);
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
    let txLength = 0;
    for (let chunk of chunkedLinks) {
      const resolvedProducts = await Promise.all(chunk);
      resolvedProducts.forEach((product) => {
        if (product.input.length === 138) {
          txsGas.push(product.gasPrice);
          txLength += 1;
        }
      });
    }
    let sumGas = txsGas.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    lastGasPrice.network = req.endpoint;
    lastGasPrice.blockNumber = block.number;
    lastGasPrice.avg = req.web3.utils.fromWei(
      parseInt(sumGas / txLength).toString(),
      'gwei',
    );
    lastGasPrice.min = req.web3.utils.fromWei(
      Math.min(...txsGas).toString(),
      'gwei',
    );
    lastGasPrice.max = req.web3.utils.fromWei(
      Math.max(...txsGas).toString(),
      'gwei',
    );
    lastGasPrice.total = req.web3.utils.fromWei(sumGas.toString(), 'gwei');
    lastGasPrice.transantionCount = txLength;
    return cwr.createWebResp(res, 200, lastGasPrice);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getGasPrice', e.message);
  }
};

const getGasPriceFromWeb3 = async (req, res) => {
  try {
    return cwr.createWebResp(res, 200, await req.web3.eth.getGasPrice());
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getGasPrice', e.message);
  }
};

const getGasPriceFromNet = async (req, res) => {
  try {
    const response = await axios.get(
      'https://ethgasstation.info/json/ethgasAPI.json',
    );
    const prices = {
      low: response.data.safeLow.toString() / 10,
      medium: response.data.average.toString() / 10,
      high: response.data.fast.toString() / 10,
      blockNumber: response.data.blockNum,
    };
    return cwr.createWebResp(res, 200, prices);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getGasPriceFromNet', e.message);
  }
};

const getTxWithAddress = async (req, res) => {
  try {
    const {address, startBlock, endBlock, page, offset, sort, isError} =
      req.query;
    const txlist = await req.etherscan.account.txlist(
      address,
      startBlock,
      endBlock,
      page,
      offset,
      sort,
    );
    if (isError) {
      const filteredTxlist = txlist.result.reduce((filteredTxlist, tx) => {
        if (tx.isError === isError) {
          filteredTxlist.push(tx);
        }
        return filteredTxlist;
      }, []);
      return cwr.createWebResp(res, 200, filteredTxlist);
    }
    return cwr.createWebResp(res, 200, txlist.result);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getTxWithAddress', e.message);
  }
};

const getTokenTxWithAddress = async (req, res) => {
  try {
    const {walletAddress, tokenAddress, startBlock, endBlock, sort} = req.query;
    const tokenTxList = await req.etherscan.account.tokentx(
      walletAddress,
      tokenAddress,
      startBlock,
      endBlock,
      null,
      null,
      sort,
    );
    return cwr.createWebResp(res, 200, tokenTxList.result);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      'E0000 - getTokenTxWithAddress',
      e.message,
    );
  }
};

const getTx = async (req, res) => {
  try {
    const {txHash} = req.query;
    const txInfo = await req.web3.eth.getTransaction(txHash);
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getTx', e.message);
  }
};

const getBlock = async (req, res) => {
  try {
    const {blockHash} = req.query;
    const blockInfo = await req.web3.eth.getBlock(blockHash);
    return cwr.createWebResp(res, 200, blockInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - getBlock', e.message);
  }
};

const postAddressFromPrivate = async (req, res) => {
  try {
    const {walletPrivateKey} = req.body;
    const ethersAccount = new ethers.Wallet(walletPrivateKey);
    return cwr.createWebResp(res, 200, {address: ethersAccount.address});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      'E0000 - postAddressFromPrivate',
      e.message,
    );
  }
};

module.exports = {
  postDecodeMnemonic,
  getEtherBalance,
  getTokenBalance,
  postSendEther,
  postSendToken,
  postGenerateMnemonic,
  getValidateMnemonic,
  getGasPrice,
  getGasPriceFromNet,
  getTxWithAddress,
  getTokenTxWithAddress,
  getTx,
  getBlock,
  postAddressFromPrivate,
};
