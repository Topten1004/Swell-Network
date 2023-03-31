const { parseEther } = require("ethers/lib/utils");
const { ethers, network } = require("hardhat");
const {
  NONFUNGIBLE_POSITION_MANAGER,
  UNISWAP_V3_FACTORY,
  UNISWAP_V3_SWAP_ROUTER,
} = require("../../../constants/addresses");
const { getTickRange } = require("./getTickRange");
const { sortTokens } = require("./sortTokens");
const { parseUSD } = require("./formatHelper");

const generateTrades = async (
  alice,
  bob,
  pool,
  tokenA,
  tokenB,
  numberOfTrades,
  seedPool = false
) => {
  const swapRouter = await ethers.getContractAt(
    "IUniswapV3SwapRouter",
    UNISWAP_V3_SWAP_ROUTER
  );
  await tokenA
    .connect(alice)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  await tokenA
    .connect(bob)
    .approve(swapRouter.address, ethers.constants.MaxUint256);

  await tokenB
    .connect(alice)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  await tokenB
    .connect(bob)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  if (seedPool) {
    await seedLiquidity(
      alice,
      parseEther("100"),
      parseEther("100"),
      tokenA,
      tokenB
    );
  }
  for (let i = 0; i < numberOfTrades; i++) {
    await network.provider.request({
      method: "evm_increaseTime",
      params: [60 * 5],
    });
    await swapRouter.connect(alice).exactInputSingle({
      tokenIn: tokenA.address,
      tokenOut: tokenB.address,
      fee: 100,
      recipient: bob.address,
      amountIn: parseEther("10"),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
    await network.provider.request({
      method: "evm_increaseTime",
      params: [60 * 5],
    });
    await swapRouter.connect(bob).exactInputSingle({
      tokenIn: tokenB.address,
      tokenOut: tokenA.address,
      fee: 100,
      recipient: alice.address,
      amountIn: parseEther("10"),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
  }
};

const generateUSDTrades = async (
  alice,
  bob,
  pool,
  tokenA,
  tokenB,
  numberOfTrades,
  seedPool = false
) => {
  const swapRouter = await ethers.getContractAt(
    "IUniswapV3SwapRouter",
    UNISWAP_V3_SWAP_ROUTER
  );
  await tokenA
    .connect(alice)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  await tokenA
    .connect(bob)
    .approve(swapRouter.address, ethers.constants.MaxUint256);

  await tokenB
    .connect(alice)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  await tokenB
    .connect(bob)
    .approve(swapRouter.address, ethers.constants.MaxUint256);
  if (seedPool) {
    await seedLiquidity(
      alice,
      parseUSD("100"),
      parseUSD("100"),
      tokenA,
      tokenB
    );
  }
  for (let i = 0; i < numberOfTrades; i++) {
    await network.provider.request({
      method: "evm_increaseTime",
      params: [60 * 5],
    });
    await swapRouter.connect(alice).exactInputSingle({
      tokenIn: tokenA.address,
      tokenOut: tokenB.address,
      fee: 100,
      recipient: bob.address,
      amountIn: parseUSD("10"),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
    await network.provider.request({
      method: "evm_increaseTime",
      params: [60 * 5],
    });
    await swapRouter.connect(bob).exactInputSingle({
      tokenIn: tokenB.address,
      tokenOut: tokenA.address,
      fee: 100,
      recipient: alice.address,
      amountIn: parseUSD("10"),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    });
  }
};

const seedLiquidity = async (whale, amountA, amountB, tokenA, tokenB) => {
  // Todo create position manager
  const positionManager = await ethers.getContractAt(
    "INonfungiblePositionManager",
    NONFUNGIBLE_POSITION_MANAGER
  );
  await tokenA
    .connect(whale)
    .approve(positionManager.address, ethers.constants.MaxUint256);
  await tokenB
    .connect(whale)
    .approve(positionManager.address, ethers.constants.MaxUint256);
  // Todo mint position
  const tokens = sortTokens(tokenA.address, tokenB.address);
  const ticks = await getTickRange(
    await (
      await ethers.getContractAt("IUniswapV3Factory", UNISWAP_V3_FACTORY)
    ).getPool(tokens[0], tokens[1], 100),
    100
  );

  await positionManager.mint({
    token0: tokens[0],
    token1: tokens[1],
    fee: 100,
    tickLower: ticks.tickLower,
    tickUpper: ticks.tickUpper,
    amount0Desired: tokens[0] === tokenA.address ? amountA : amountB,
    amount1Desired: tokens[1] === tokenB.address ? amountB : amountA,
    amount0Min: 0,
    amount1Min: 0,
    recipient: whale.address,
    deadline: Math.ceil(Date.now().valueOf() / 1000) + 5000,
  });
};

module.exports = {
  generateTrades,
  generateUSDTrades,
};
