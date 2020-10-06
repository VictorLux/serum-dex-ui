export const formatMarketName = (marketName) => {
  let splitString = marketName ? marketName.split('/') : '';
  if (splitString[0] && splitString[1]) {
    if (splitString[1] === 'USDC') {
      splitString[1] = 'USD';
    }
    if (splitString[0] === 'MSRM') {
      splitString[0] = 'SRM';
    }
    return splitString[0] + splitString[1];
  }
};
