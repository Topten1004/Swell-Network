/* eslint-disable no-unused-vars */
const { ethers } = require("hardhat");
const {
  NONFUNGIBLE_POSITION_MANAGER,
} = require("../../../constants/addresses");

const mintPosition = async (
  poolAddress,
  tokenAAddress,
  tokenBAddress,
  amountA,
  amountB,
  whale
) => {
  const pool = await ethers.getContractAt("IUniswapV3Pool", poolAddress);
  const positionManager = await ethers.getContractAt(
    "INonfungiblePositionManager",
    NONFUNGIBLE_POSITION_MANAGER
  );
  const tokenA = await ethers.getContractAt("IERC20", tokenAAddress);
  const tokenB = await ethers.getContractAt("IERC20", tokenBAddress);

  //   await positionManager.mint({});
};

module.exports = {
  mintPosition,
};
