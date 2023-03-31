const { nearestUsableTick } = require("@uniswap/v3-sdk");
const { ethers } = require("hardhat");

const getTickRange = async (poolAddress, tickSpacingMultiplier = 2) => {
  const poolContract = await ethers.getContractAt(
    "IUniswapV3Pool",
    poolAddress
  );
  const slot = await poolContract.slot0();
  const tickSpacing = await poolContract.tickSpacing();
  return {
    tickLower:
      nearestUsableTick(slot.tick, tickSpacing) -
      tickSpacing * tickSpacingMultiplier,
    tickUpper:
      nearestUsableTick(slot.tick, tickSpacing) +
      tickSpacing * tickSpacingMultiplier,
  };
};

module.exports = {
  getTickRange,
};
