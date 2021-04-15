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

module.exports = {
  switchBaseUrl,
  defaultGasAvg,
  defaultGasMin,
  defaultGasMax,
};
