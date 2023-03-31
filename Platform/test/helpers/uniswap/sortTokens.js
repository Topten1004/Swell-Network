const { ethers } = require("hardhat");

const sortTokens = (tokenA, tokenB) => {
  const tokens = [tokenA, tokenB].sort((a, b) => {
    const c = ethers.BigNumber.from(a).sub(ethers.BigNumber.from(b));

    if (c.eq(ethers.BigNumber.from("0"))) {
      return 0;
    } else if (c.gt(ethers.BigNumber.from("1"))) {
      return 1;
    } else {
      return -1;
    }
  });
  return tokens;
};

module.exports = {
  sortTokens,
};
