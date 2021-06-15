const cwr = require('../utils/createWebResp');
const tokenABI = require('../config/ETH/AtemTokenABI');
const StandardTokenABI = require('../config/ETH/StandardTokenABI');
//const tokenAddress = "0x6A9Affd39410Da9C7eD69514b7E12A63871D6572"; // WKR
//const tokenAddress = "0xf7cfC9f0d1acca77a12eF46C493C4C92997E47B6"; // myToken
//const tokenAddress = "0xc46e7a0459f64cea4000e199782d7fdd86c96816"; // ropsten WKR
//const tokenAddress = "0x66B7f52816999cE6b5008cB68cB7B9F0f13008cA"; // ropsten dddaib

const test = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;

    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const tokenContract = new req.web3.eth.Contract(
      tokenABI.tokenABI,
      tokenAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
    );


    const totalSupply = await tokenContract.methods.totalSupply().call();

    const isAdmin = await tokenContract.methods.isAdmin(myWalletAddress).call();

    const isOwner = await tokenContract.methods.isOwner(myWalletAddress).call();

    const decimals = await tokenContract.methods.decimals().call();

    return cwr.createWebResp(res, 200, {totalSupply, isAdmin, isOwner, decimals});
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - test', e.message);
  }
};

const getBalance = async (req, res) => {
  try {
    const {address} = req.query;
    const contract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
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

const getTimeLockList = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.tokenABI,
      tokenAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .timelockList(myWalletAddress, req.web3.utils.toHex(totalAmount));
    console.log(contractRawTx);

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: tokenAddress,
      from: myWalletAddress,
      data: contractRawTx.encodeABI(),
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
    return cwr.errorWebResp(res, 500, 'E0000 - getTimeLockList', e.message);
  }
};

const postBurn = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;
    const tokenContract = new req.web3.eth.Contract(
      tokenABI.tokenABI,
      tokenAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .burn(req.web3.utils.toHex(totalAmount))
      .encodeABI();

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: tokenAddress,
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
    return cwr.errorWebResp(res, 500, 'E0000 - postBurn', e.message);
  }
};

const postLock = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
      lockTime,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.tokenABI,
      tokenAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .lock(myWalletAddress, req.web3.utils.toHex(totalAmount), req.web3.utils.toHex(lockTime))
      .encodeABI();
    console.log("contractRawTx length: ", contractRawTx.length);

    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: tokenAddress,
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    console.log("rawTransaction length: ", signedTx.rawTransaction.length);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postLock', e.message);
  }
};

const postUnlock = async (req, res) => {
  try {
    const {
      myWalletAddress,
      myWalletPrivateKey,
      amountToken,
      gasPrice,
      gasLimit,
    } = req.body;

    const tokenContract = new req.web3.eth.Contract(
      tokenABI.tokenABI,
      tokenAddress,
    );
    const standardContract = new req.web3.eth.Contract(
      StandardTokenABI.StandardABI,
      tokenAddress,
    );
    const decimal = Math.pow(10, await standardContract.methods.decimals().call());
    let totalAmount = (decimal*amountToken).toLocaleString('fullwide', {useGrouping:false});
    let contractRawTx = await tokenContract.methods
      .unlock(myWalletAddress, req.web3.utils.toHex(totalAmount))
      .encodeABI();

    console.log("contractRawTx length: ", contractRawTx.length);
    const rawTx = {
      gasPrice: req.web3.utils.toHex(
        req.web3.utils.toWei(gasPrice.toString(), 'gwei'),
      ),
      gasLimit: req.web3.utils.toHex(gasLimit?.toString()),
      to: tokenAddress,
      from: myWalletAddress,
      data: contractRawTx,
      value: '0x0',
    };
    const account = req.web3.eth.accounts.privateKeyToAccount(
      myWalletPrivateKey,
    );
    const signedTx = await account.signTransaction(rawTx);
    console.log("rawTransaction length: ", signedTx.rawTransaction.length);
    const txInfo = await req.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    return cwr.createWebResp(res, 200, txInfo);
  } catch (e) {
    return cwr.errorWebResp(res, 500, 'E0000 - postUnlock', e.message);
  }
};


module.exports = {
  test,
  getBalance,
  postBurn,
  postLock,
  postUnlock,
  getTimeLockList,
};
