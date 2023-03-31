const { BigNumber } = require("ethers");

const parseUSD = (number) => {
  return BigNumber.from(parseInt(number) * 10 ** 6);
};

const formatUSD = (number) => {
  return number.div(10 ** 6).toString();
};

module.exports = {
  parseUSD,
  formatUSD,
};
