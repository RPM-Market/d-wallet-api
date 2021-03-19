const StellarSdk = require('stellar-sdk');
const StellarHDWallet = require('stellar-hd-wallet');
const axios = require('axios');
const cwr = require('../utils/createWebResp');
const xlmUtils = require('../utils/xlm/utils');

const postKey = async (req, res) => {
  try {
    const pair = StellarSdk.Keypair.random();
    return cwr.createWebResp(res, 200, {
      publicKey: pair.publicKey(),
      secretKey: pair.secret(),
    });
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postKey`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getFeeStats = async (req, res) => {
  try {
    // const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const {server} = req;
    const resp = await server.feeStats();
    return cwr.createWebResp(res, 200, resp);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getFeeStats`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postMnemonic = async (req, res) => {
  try {
    const mnemonic = StellarHDWallet.generateMnemonic({entropyBits: 128});
    return cwr.createWebResp(res, 200, {mnemonic});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postMnemonic`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postDecodeMnemonic = async (req, res) => {
  try {
    const {mnemonic, index} = req.body;
    const wallet = StellarHDWallet.fromMnemonic(mnemonic);
    const publicKey = wallet.getPublicKey(index).toString();
    const secretKey = wallet.getSecret(index).toString();
    return cwr.createWebResp(res, 200, {publicKey, secretKey});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postMnemonic`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postDecodeSecret = async (req, res) => {
  try {
    const {secretKey} = req.body;
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const publicKey = keypair.publicKey();
    return cwr.createWebResp(res, 200, {publicKey});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postDecodeSecret`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getBalance = async (req, res) => {
  try {
    const {network, address} = req.query;
    const {server} = req;
    const account = await server.loadAccount(address);
    const {balances} = account;
    return cwr.createWebResp(res, 200, {network, address, balances});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getBalance`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getAccountDetail = async (req, res) => {
  try {
    const {network, address} = req.query;
    const {server} = req;
    const account = await server.loadAccount(address);
    return cwr.createWebResp(res, 200, {network, address, account});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getAccountDetail`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postAccount = async (req, res) => {
  try {
    const {server, networkPassphrase} = req;
    const {
      toAddress,
      createFromSecret, // 초기잔액을 충천할 계정 비밀키
      startingBalance, // 초기잔액 수량
    } = req.body;
    const keypair = StellarSdk.Keypair.fromSecret(createFromSecret);
    const txOptions = {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    };
    const loadedAccount = await server.loadAccount(keypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(
      loadedAccount,
      txOptions,
    )
      .addOperation(
        StellarSdk.Operation.createAccount({
          destination: toAddress,
          startingBalance, // 계정 유지를 위한 최소 1XLM 이상 필요
        }),
      )
      .addMemo(StellarSdk.Memo.text('Create Account'))
      .setTimeout(xlmUtils.TIMEOUT)
      .build();
    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);
    return cwr.createWebResp(res, 200, result);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postAccount`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postPayment = async (req, res) => {
  try {
    const {toAddress, amount, memo} = req.body;
    const {asset, server} = req;
    const txOptions = {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: req.networkPassphrase,
    };
    const keypair = StellarSdk.Keypair.fromSecret(req.body.secretKey);
    const fromAddress = keypair.publicKey();
    const loadedAccount = await server.loadAccount(fromAddress);
    const transaction = new StellarSdk.TransactionBuilder(
      loadedAccount,
      txOptions,
    )
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toAddress,
          asset,
          amount: amount.toString(),
        }),
      )
      .addMemo(memo ? StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
      .setTimeout(xlmUtils.TIMEOUT)
      .build();
    transaction.sign(keypair);
    const resp = await server.submitTransaction(transaction);
    return cwr.createWebResp(res, 200, resp);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postPayment`,
      xlmUtils.parseOperationError(e),
    );
  }
};

// const postEarnCoin = async (req, res) => {
//   try {
//     const {server} = req;
//     const {publicKey} = req.body;
//     // DB 연동 시 생성됨, stellar-core new-db 명령어에서 확인 가능
//     const keypair = StellarSdk.Keypair.fromSecret(
//       'PUT_SECRET_KEY_IN_HERE'
//     );
//     const result = await server
//       .loadAccount(keypair.publicKey())
//       .then(function (sourceAccount) {
//         const transaction = new StellarSdk.TransactionBuilder(sourceAccount)
//           .addOperation(
//             StellarSdk.Operation.createAccount({
//               destination: publicKey,
//               startingBalance: '1000',
//             }),
//           )
//           .addMemo(StellarSdk.Memo.text('Test Transaction'))
//           .setTimeout(xlmUtils.TIMEOUT)
//           .build();
//         transaction.sign(keypair);
//       });
//     // todo submit transaction 하면 될듯? 빠트림...
//     return cwr.createWebResp(res, 200, result);
//   } catch (e) {
//     return cwr.errorWebResp(
//       res,
//       500,
//       `E0000 - postEarnCoin`,
//       xlmUtils.parseOperationError(e),
//     );
//   }
// };

const postTrustAsset = async (req, res) => {
  try {
    const {asset, server} = req;
    const txOptions = {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: req.networkPassphrase,
    };
    const keypair = StellarSdk.Keypair.fromSecret(req.body.secretKey);
    const fromAddress = keypair.publicKey();
    const loadedAccount = await server.loadAccount(fromAddress);
    const transaction = new StellarSdk.TransactionBuilder(
      loadedAccount,
      txOptions,
    )
      .addOperation(StellarSdk.Operation.changeTrust({asset}))
      .setTimeout(xlmUtils.TIMEOUT)
      .build();
    transaction.sign(keypair);
    const resp = await server.submitTransaction(transaction);
    return cwr.createWebResp(res, 200, resp);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postTrustAsset`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getLastBlock = async (req, res) => {
  try {
    const {serverUrl} = req;
    const resp = await axios.get(`${serverUrl}/ledgers?limit=1&order=desc`);
    const lastBlockNo = resp.data?._embedded.records[0]?.sequence;
    return cwr.createWebResp(res, 200, {lastBlockNo});
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getLastBlock`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getTransactions = async (req, res) => {
  try {
    const {serverUrl} = req;
    const {account} = req.query;
    const resp = await axios.get(
      `${serverUrl}/accounts/${account}/transactions?limit=200&order=desc`,
    );
    return cwr.createWebResp(res, 200, resp.data);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getTransactions`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const getTxId = async (req, res) => {
  try {
    const {serverUrl} = req;
    const {id} = req.query;
    const resp = await axios.get(`${serverUrl}/transactions/${id}`);
    return cwr.createWebResp(res, 200, resp.data);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - getTxId`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postMultiSig = async (req, res) => {
  try {
    const {server, networkPassphrase} = req;
    const {accounts} = req.body;
    const rootKeypair = StellarSdk.Keypair.fromSecret(accounts['0'].secretKey);
    const secondaryKeypair = StellarSdk.Keypair.fromSecret(
      accounts['1'].secretKey,
    );
    const loadAccount = await server.loadAccount(
      rootKeypair.publicKey(),
      rootKeypair.sequence,
    );
    const account = new StellarSdk.Account(
      rootKeypair.publicKey(),
      loadAccount.sequence,
    );
    const secondaryAddress = secondaryKeypair.publicKey();
    const txOptions = {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    };
    const transaction = new StellarSdk.TransactionBuilder(account, txOptions)
      .addOperation(
        StellarSdk.Operation.setOptions({
          signer: {
            ed25519PublicKey: secondaryAddress,
            weight: 1,
          },
        }),
      )
      .addOperation(
        StellarSdk.Operation.setOptions({
          masterWeight: 1, // set master key weight
          lowThreshold: 1,
          medThreshold: 2, // a payment is medium threshold
          highThreshold: 2, // make sure to have enough weight to add up to the high threshold!
        }),
      )
      .setTimeout(xlmUtils.TIMEOUT)
      .build();
    // only need to sign with the root signer as the 2nd signer won't be
    // added to the account till after this transaction completes
    transaction.sign(rootKeypair);
    const resp = await server.submitTransaction(transaction);
    return cwr.createWebResp(res, 200, resp);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postMultiSig`,
      xlmUtils.parseOperationError(e),
    );
  }
};

const postMultiSigPayment = async (req, res) => {
  try {
    const {asset, server, networkPassphrase} = req;
    const {accounts, toAddress, amount, memo} = req.body;
    const rootKeypair = StellarSdk.Keypair.fromSecret(accounts['0'].secretKey);
    const secondaryKeypair = StellarSdk.Keypair.fromSecret(
      accounts['1'].secretKey,
    );
    const loadedAccount = await server.loadAccount(
      rootKeypair.publicKey(),
      rootKeypair.sequence,
    );
    const txOptions = {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    };
    const transaction = new StellarSdk.TransactionBuilder(
      loadedAccount,
      txOptions,
    )
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toAddress,
          asset,
          amount: amount.toString(),
        }),
      )
      .addMemo(memo ? StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
      .setTimeout(xlmUtils.TIMEOUT)
      .build();

    // Signing MultiSig
    transaction.sign(rootKeypair);
    transaction.sign(secondaryKeypair);
    const resp = await server.submitTransaction(transaction);
    return cwr.createWebResp(res, 200, resp);
  } catch (e) {
    return cwr.errorWebResp(
      res,
      500,
      `E0000 - postMultiSigPayment`,
      xlmUtils.parseOperationError(e),
    );
  }
};

module.exports = {
  postKey,
  getFeeStats,
  postMnemonic,
  postDecodeMnemonic,
  postDecodeSecret,
  getBalance,
  getAccountDetail,
  postAccount,
  postPayment,
  // postEarnCoin,
  postTrustAsset,
  getLastBlock,
  getTransactions,
  getTxId,
  postMultiSig,
  postMultiSigPayment,
};
