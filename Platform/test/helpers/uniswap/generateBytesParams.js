const { ethers } = require("hardhat");
const { sortTokens } = require("./sortTokens");
const { SqrtPriceMath } = require("@uniswap/v3-sdk");
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const JSBI = require("jsbi");

const _getCurrentPrice = async (poolAddress) => {
  return (
    await (await ethers.getContractAt(IUniswapV3PoolABI, poolAddress)).slot0()
  ).sqrtPriceX96;
};

const isToken0 = (token0, token1) => {
  const tokens = sortTokens(token0, token1);
  if (tokens[0] == token0) {
    return true;
  } else {
    return false;
  }
};

const _getQuoteForToken = async (
  tokenIn,
  tokenOut,
  fee,
  amountIn,
  quoterAddress
) => {
  const quoterContract = await ethers.getContractAt(QuoterABI, quoterAddress);
  return ethers.BigNumber.from(
    await quoterContract.callStatic.quoteExactInputSingle(
      tokenIn,
      tokenOut,
      fee,
      amountIn.toString(),
      0
    )
  );
};

const _getPriceLimit = async (amountIn, pool, swellVault, token0, token1) => {
  return SqrtPriceMath.getNextSqrtPriceFromInput(
    JSBI.BigInt((await _getCurrentPrice(pool.address)).toString()),
    JSBI.BigInt(
      (
        await swellVault.getRequiredLiquidity(
          amountIn,
          isToken0(token0.address, token1.address)
        )
      ).toString()
    ),
    JSBI.BigInt(amountIn.toString()),
    isToken0(token0.address, token1.address)
  ).toString();
};

const _roundDown = (amountIn) => {
  return amountIn.div((10 ** 18).toString()).mul((10 ** 18).toString());
};

const generateParams = async (
  amountIn,
  inputToken,
  outputToken,
  fee,
  quoter,
  pool,
  vault
) => {
  let amountOutMin = await _getQuoteForToken(
    inputToken.address,
    outputToken.address,
    fee,
    amountIn,
    quoter
  );
  const sqrtPriceLimitX96 = await _getPriceLimit(
    amountIn,
    pool,
    vault,
    inputToken,
    outputToken
  );
  amountOutMin =
    _roundDown(amountOutMin).toString() == "0"
      ? amountOutMin
      : _roundDown(amountOutMin);

  return ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint256", "uint160"],
    [amountIn, amountOutMin, sqrtPriceLimitX96]
  );
};

module.exports = {
  _getCurrentPrice,
  isToken0,
  _getQuoteForToken,
  _getPriceLimit,
  _roundDown,
  generateParams,
};
