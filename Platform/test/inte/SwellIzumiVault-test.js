const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const {
  NONFUNGIBLE_POSITION_MANAGER,
  UNISWAP_V3_QUOTER,
  UNISWAP_V3_SWAP_ROUTER,
} = require("../../constants/addresses");
const {
  IZUMI_LIQUID_BOX,
  USDT_ADDRESS,
  USDC_ADDRESS,
  USD_WHALE,
  UNISWAP_USDT_USDC_POOL,
} = require("../constants/izumiTestVariables");
const { getTickRange } = require("../helpers/uniswap/getTickRange");
const {
  _getQuoteForToken,
  _getPriceLimit,
  generateParams,
} = require("../helpers/uniswap/generateBytesParams");
const { parseUSD } = require("../helpers/uniswap/formatHelper");

const nftAddress = "0xe59aC2C5Ae8462554308c578aE4bc8e4098d0414";

describe("Swell Izumi Vault", () => {
  let swellVault, positionManager;
  let owner, alice;
  let pool;
  let FEE;

  let USDT;
  let USDC;
  let testToken;
  let weth;

  before(async () => {
    [owner, alice] = await ethers.getSigners();
    positionManager = await ethers.getContractAt(
      "INonfungiblePositionManager",
      NONFUNGIBLE_POSITION_MANAGER
    );
    pool = await ethers.getContractAt("IUniswapV3Pool", UNISWAP_USDT_USDC_POOL);

    FEE = (await pool.fee()).toString();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USD_WHALE],
    });

    const signer = await ethers.provider.getSigner(USD_WHALE);

    USDT = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      USDT_ADDRESS
    );
    USDC = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      USDC_ADDRESS
    );

    const whaleBalance = await USDT.balanceOf(USD_WHALE);
    USDT.connect(signer).transfer(alice.address, whaleBalance.div(2));
    USDT.connect(signer).transfer(owner.address, whaleBalance.div(2));

    const testTickSpacing = await getTickRange(pool.address, 100);

    const swellVaultFactory = await ethers.getContractFactory(
      "SwellIzumiVault"
    );

    swellVault = await swellVaultFactory.deploy({
      asset: USDT.address,
      swNFT: nftAddress,
      name: "Test Swell Uniswap Vault Token",
      symbol: "TSUVT",
      positionManager: NONFUNGIBLE_POSITION_MANAGER,
      swapRouter: UNISWAP_V3_SWAP_ROUTER,
      poolData: {
        pool: pool.address,
        counterToken: USDC.address,
        fee: await pool.fee(),
        tickLower: testTickSpacing.tickLower,
        tickUpper: testTickSpacing.tickUpper,
        liquidityPerTick: await pool.maxLiquidityPerTick(),
      },
      IzumiLiquidBox: IZUMI_LIQUID_BOX,
    });

    await USDC.approve(swellVault.address, ethers.constants.MaxUint256);
    await USDT.approve(swellVault.address, ethers.constants.MaxUint256);
    await USDC.connect(alice).approve(
      swellVault.address,
      ethers.constants.MaxUint256
    );
    await USDT.connect(alice).approve(
      swellVault.address,
      ethers.constants.MaxUint256
    );
    await USDC.connect(alice).approve(
      positionManager.address,
      ethers.constants.MaxUint256
    );
    await USDT.connect(alice).approve(
      positionManager.address,
      ethers.constants.MaxUint256
    );

    testToken = USDT;
    weth = USDC;
  });

  it("should create a new position if this is the first deposit", async () => {
    expect(await swellVault.nftID()).to.be.eq(0);

    let amountToDeposit = parseUSD("100");
    let amountIn = amountToDeposit.div(2);
    let swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );

    await swellVault.deposit(amountToDeposit, owner.address, swapParams);

    expect(await swellVault.nftID()).to.be.gt(0);
  });

  it("should increase the value of the existing position when depositing", async () => {
    const startingLiquidity = (
      await positionManager.positions(await swellVault.nftID())
    ).liquidity;

    let amountToDeposit = parseUSD("1000");
    let amountIn = amountToDeposit.div(2);
    let swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );

    await swellVault
      .connect(alice)
      .deposit(amountToDeposit, alice.address, swapParams);

    expect(startingLiquidity).to.be.lt(
      (await positionManager.positions(await swellVault.nftID())).liquidity
    );
  });

  it("should handle multiple deposits", async () => {
    let amountToDeposit = parseUSD("100");
    let amountIn = amountToDeposit.div(2);
    let swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );

    const ownerStartingShares = await swellVault.balanceOf(owner.address);
    const aliceStartingShares = await swellVault.balanceOf(alice.address);
    const startingLiquidity = (
      await positionManager.positions(await swellVault.nftID())
    ).liquidity;

    for (let i = 0; i < 3; i++) {
      swapParams = generateParams(
        amountIn,
        testToken,
        weth,
        FEE,
        UNISWAP_V3_QUOTER,
        pool,
        swellVault
      );

      await swellVault
        .connect(alice)
        .deposit(amountToDeposit, alice.address, swapParams);

      swapParams = generateParams(
        amountIn,
        testToken,
        weth,
        FEE,
        UNISWAP_V3_QUOTER,
        pool,
        swellVault
      );

      await swellVault.deposit(amountToDeposit, owner.address, swapParams);
    }
    expect(startingLiquidity).to.be.lt(
      (await positionManager.positions(await swellVault.nftID())).liquidity
    );
    expect(ownerStartingShares).to.be.lt(
      await swellVault.balanceOf(owner.address)
    );
    expect(aliceStartingShares).to.be.lt(
      await swellVault.balanceOf(alice.address)
    );
  });

  it("should swap into the correct ratio", async () => {
    let amountToDeposit = parseUSD("120000");
    let amountIn = amountToDeposit.div(3);
    let swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );

    const startingBalanceTestToken = await testToken.balanceOf(
      swellVault.address
    );
    await swellVault.deposit(amountToDeposit, owner.address, swapParams);
    expect(await testToken.balanceOf(swellVault.address)).to.be.gt(
      startingBalanceTestToken
    );
    expect(await weth.balanceOf(swellVault.address)).to.be.eq(0); // Should always add all the eth swapped for back to the pool
  });

  it("should properly account for internal funds", async () => {
    let amountToDeposit = parseUSD("300000");
    let amountIn = amountToDeposit.div(4);
    let swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );

    await swellVault.deposit(amountToDeposit, owner.address, swapParams);
    const amountBefore = await testToken.balanceOf(swellVault.address);

    swapParams = generateParams(
      amountIn,
      testToken,
      weth,
      FEE,
      UNISWAP_V3_QUOTER,
      pool,
      swellVault
    );
    await swellVault.deposit(amountToDeposit, owner.address, swapParams);
    expect(await testToken.balanceOf(swellVault.address)).to.not.be.eq(
      amountBefore
    );
  });

  it("Should not work with invalid parameters", async () => {
    const abiCoder = ethers.utils.defaultAbiCoder;

    const INVALID_ASSETS = 0;
    const INVALID_AMOUNT_IN = 0;
    const INVALID_AMOUNT_OUT_MIN = 0;
    const INVALID_SQRT_LIMIT = 0;

    let amountToDeposit = parseUSD("200000");
    let amountIn = amountToDeposit.div(2);

    let amountOutMin = await _getQuoteForToken(
      testToken.address,
      weth.address,
      FEE,
      amountIn,
      UNISWAP_V3_QUOTER
    );
    let sqrtPriceLimitX96 = await _getPriceLimit(
      amountIn,
      pool,
      swellVault,
      testToken,
      weth
    );
    let swapParams = abiCoder.encode(
      ["uint256", "uint256", "uint160"],
      [amountIn, amountOutMin, sqrtPriceLimitX96]
    );
    await expect(swellVault.deposit(INVALID_ASSETS, owner.address, swapParams))
      .to.be.reverted;

    sqrtPriceLimitX96 = await _getPriceLimit(
      amountIn,
      pool,
      swellVault,
      testToken,
      weth
    );
    swapParams = abiCoder.encode(
      ["uint256", "uint256", "uint160"],
      [INVALID_AMOUNT_IN, amountOutMin, sqrtPriceLimitX96]
    );
    await expect(
      swellVault.deposit(amountToDeposit, owner.address, swapParams)
    ).to.be.revertedWith("amountIn 0");

    sqrtPriceLimitX96 = await _getPriceLimit(
      amountIn,
      pool,
      swellVault,
      testToken,
      weth
    );
    swapParams = abiCoder.encode(
      ["uint256", "uint256", "uint160"],
      [amountIn, INVALID_AMOUNT_OUT_MIN, sqrtPriceLimitX96]
    );
    await expect(
      swellVault.deposit(amountToDeposit, owner.address, swapParams)
    ).to.be.revertedWith("amountOutMin 0");

    sqrtPriceLimitX96 = await _getPriceLimit(
      amountIn,
      pool,
      swellVault,
      testToken,
      weth
    );
    swapParams = abiCoder.encode(
      ["uint256", "uint256", "uint160"],
      [amountIn, amountOutMin, INVALID_SQRT_LIMIT]
    );
    await expect(
      swellVault.deposit(amountToDeposit, owner.address, swapParams)
    ).to.be.revertedWith("priceLimit 0");
  });
});
