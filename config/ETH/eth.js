const switchBaseUrl = (network) => {
  switch (network) {
    default:
      throw 'switchBaseUrl : endpoint error (' + network + ')';
    case 'ropsten':
    case 'mainnet':
    case 'kivan':
    case 'rinkeby':
    case 'goerli':
      return 'https://' + network + '.infura.io/v3/';
  }
};

const defaultGasAvg = 60000;
const defaultGasMin = 21000;
const defaultGasMax = 7000000;
const maxIDValue = 2147483647;
const minIDValue = 0;
const defaultWalletPath = "m/44'/60'/0'/0/";


module.exports = {
  switchBaseUrl,
  defaultGasAvg,
  defaultGasMin,
  defaultGasMax,
  maxIDValue,
  minIDValue,
  defaultWalletPath,
};
