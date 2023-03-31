const { expect } = require("chai");
const { ethers } = require("hardhat");
const { chainDeposit } = require("../helpers/chainDeposit");
const { createBalancerPool } = require("../helpers/createBalancerPool");
const { VAULT } = require("../../constants/addresses");
const {
  getTestTokenBalanceFromBalancerPool,
} = require("../helpers/getTestTokenBalanceFromBalancerPool");

const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

/*///////////////////////////////////////////////////////////////
                    BALANCER VAULT TEST SUITE
    //////////////////////////////////////////////////////////////*/
describe("Swell Balancer Vault", function () {
  let swellBalancerVault,
    swETH,
    balancerVault,
    account1,
    account2,
    account3,
    account4,
    poolId;

  const nftAddress = "0xe59aC2C5Ae8462554308c578aE4bc8e4098d0414";

  /**
   * before each test:
   * - deploy the test token contract, initialise the WETH/SWETH token pool and deploy the swell balancer vault contract
   * - transfer 100,000 test tokens each of the test accounts using the deployer account
   * - approve the swell balancer vault contract to transfer tokens in the test token contract for all the test accounts
   */
  before(async function () {
    const [deployer, alice, bob, carol, ted] = await ethers.getSigners();
    account1 = alice;
    account2 = bob;
    account3 = carol;
    account4 = ted;

    // we get an instantiated contract in the form of a ethers.js Contract instance:
    const SWETH = await ethers.getContractFactory("contracts/swETH.sol:SWETH");
    swETH = await SWETH.deploy(deployer.address);
    await swETH.deployed();

    await swETH.connect(deployer).mint(ethers.utils.parseEther("100000000"));

    // get the test token and wrapped ether contracts
    const wethToken = await ethers.getContractAt(
      "contracts/interfaces/IWETH.sol:IWETH",
      wethAddress
    );

    // deposit one thousand ether from the deployer account into the wrapped ether contract
    await wethToken
      .connect(deployer)
      .deposit({ value: ethers.utils.parseEther("1000") });

    // create a WETH/TEST balancer pool
    poolId = await createBalancerPool(
      deployer.address,
      swETH.address,
      wethToken.address
    );

    const SwellBalancerVault = await ethers.getContractFactory(
      "contracts/SwellBalancerVault.sol:SwellBalancerVault"
    );
    swellBalancerVault = await SwellBalancerVault.deploy(
      swETH.address,
      nftAddress,
      "Test Swell Balancer Vault Token",
      "TSBVT",
      VAULT,
      poolId
    );
    balancerVault = await ethers.getContractAt(
      "contracts/interfaces/IVault.sol:IVault",
      VAULT
    );

    // transfer test tokens to the other addresses from the deployer account, deployer account will be initialised with one million test tokens, (will only have 999,990 after creating the balancer pool)
    await swETH
      .connect(deployer)
      .transfer(account1.address, ethers.utils.parseEther("100000"));

    await swETH
      .connect(deployer)
      .transfer(account2.address, ethers.utils.parseEther("100000"));

    await swETH
      .connect(deployer)
      .transfer(account3.address, ethers.utils.parseEther("100000"));

    await swETH
      .connect(deployer)
      .transfer(account4.address, ethers.utils.parseEther("100000"));

    // approve the swell balancer vault to transfer tokens in the token contract for all the test accounts
    await swETH
      .connect(deployer)
      .approve(swellBalancerVault.address, ethers.constants.MaxUint256);
    await swETH
      .connect(account1)
      .approve(swellBalancerVault.address, ethers.constants.MaxUint256);
    await swETH
      .connect(account2)
      .approve(swellBalancerVault.address, ethers.constants.MaxUint256);
    await swETH
      .connect(account3)
      .approve(swellBalancerVault.address, ethers.constants.MaxUint256);
    await swETH
      .connect(account4)
      .approve(swellBalancerVault.address, ethers.constants.MaxUint256);

    // get the initial test token balancer pool balance
    await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );
  });

  /*///////////////////////////////////////////////////////////////
                    ACCOUNT BALANCES TESTS
    //////////////////////////////////////////////////////////////*/
  it("Account 1 should have 100,000 test tokens ", async () => {
    expect(await swETH.balanceOf(account1.address)).equals(
      ethers.utils.parseEther("100000")
    );
  });

  it("Account 2 should have 100,000 test tokens ", async () => {
    expect(await swETH.balanceOf(account2.address)).equals(
      ethers.utils.parseEther("100000")
    );
  });

  it("Account 3 should have 100,000 test tokens ", async () => {
    expect(await swETH.balanceOf(account3.address)).equals(
      ethers.utils.parseEther("100000")
    );
  });

  it("Account 4 should have 100,000 test tokens ", async () => {
    expect(await swETH.balanceOf(account4.address)).equals(
      ethers.utils.parseEther("100000")
    );
  });

  /*///////////////////////////////////////////////////////////////
                    WHOLE VALUE DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/
  it("Depositing 1 test token to the swell balancer vault should add 1 test token to the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("1");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  it("Depositing a 10,000 tokens to the swell balancer vault should add 10,000 tokens to the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("10000");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  /*///////////////////////////////////////////////////////////////
                    DECIMAL VALUE DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/
  it("Depositing 1.5 tokens to the swell balancer vault should add 1.5 tokens to the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("1.5");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  it("Depositing 10,000.5 tokens to the swell balancer vault should add 10,000.5 tokens to the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("10000.5");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  it("Depositing 0.1 token to the swell balancer vault should add 0.1 token to the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("0.1");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  it("Depositing 0.123456789 token to the swell balancer vault should add 0.123456789 token to the test token balancer pool contract", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("0.123456789");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  it("Depositing 0.123456789123456789 token to the swell balancer vault should add 0.123456789123456789 token to the test token balancer pool contract", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("0.123456789123456789");
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await swellBalancerVault
      .connect(account1)
      .deposit(amount, account1.address, 0);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount)
    );
    expect(swETHPoolBalance).eq(swETHBeforePoolBalance.add(amount));
  });

  /*///////////////////////////////////////////////////////////////
                    SAME ACCOUNT DEPOSITS TESTS
    //////////////////////////////////////////////////////////////*/
  it("Two deposits from the same account summed up should equal the test token balance in the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("1");
    const deposits = 2;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount.mul(deposits))
    );
    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits))
    );
  });

  it("Multiple deposits from the same account summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalance = await swETH.balanceOf(account1.address);
    const amount = ethers.utils.parseEther("1");
    const deposits = 10;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalance.sub(amount.mul(deposits))
    );
    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits))
    );
  });

  /*///////////////////////////////////////////////////////////////
                    MULTIPLE ACCOUNT DEPOSITS TESTS
    //////////////////////////////////////////////////////////////*/
  it("One deposit from two different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const numAccounts = 2;
    const amount = ethers.utils.parseEther("1");
    const deposits = 1;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  it("Multiple deposits from two different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const numAccounts = 2;
    const amount = ethers.utils.parseEther("1");
    const deposits = 10;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  it("One deposit from three different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const originalBalanceAccount3 = await swETH.balanceOf(account3.address);
    const numAccounts = 3;
    const amount = ethers.utils.parseEther("1");
    const deposits = 1;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account3);
    expect(await swETH.balanceOf(account3.address)).equal(
      originalBalanceAccount3.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  it("Multiple deposits from three different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const originalBalanceAccount3 = await swETH.balanceOf(account3.address);
    const numAccounts = 3;
    const amount = ethers.utils.parseEther("1");
    const deposits = 10;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account3);
    expect(await swETH.balanceOf(account3.address)).equal(
      originalBalanceAccount3.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  it("One deposit from four different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const originalBalanceAccount3 = await swETH.balanceOf(account3.address);
    const originalBalanceAccount4 = await swETH.balanceOf(account4.address);
    const numAccounts = 4;
    const amount = ethers.utils.parseEther("1");
    const deposits = 1;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account3);
    expect(await swETH.balanceOf(account3.address)).equal(
      originalBalanceAccount3.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account4);
    expect(await swETH.balanceOf(account4.address)).equal(
      originalBalanceAccount4.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  it("Multiple deposits from four different accounts summed up should equal the token balance in the test token balancer pool", async () => {
    const originalBalanceAccount1 = await swETH.balanceOf(account1.address);
    const originalBalanceAccount2 = await swETH.balanceOf(account2.address);
    const originalBalanceAccount3 = await swETH.balanceOf(account3.address);
    const originalBalanceAccount4 = await swETH.balanceOf(account4.address);
    const numAccounts = 4;
    const amount = ethers.utils.parseEther("1");
    const deposits = 10;
    const swETHBeforePoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account1);
    expect(await swETH.balanceOf(account1.address)).equal(
      originalBalanceAccount1.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account2);
    expect(await swETH.balanceOf(account2.address)).equal(
      originalBalanceAccount2.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account3);
    expect(await swETH.balanceOf(account3.address)).equal(
      originalBalanceAccount3.sub(amount.mul(deposits))
    );

    await chainDeposit(swellBalancerVault, deposits, amount, account4);
    expect(await swETH.balanceOf(account4.address)).equal(
      originalBalanceAccount4.sub(amount.mul(deposits))
    );

    const swETHPoolBalance = await getTestTokenBalanceFromBalancerPool(
      balancerVault,
      poolId,
      swETH.address
    );

    expect(swETHPoolBalance).eq(
      swETHBeforePoolBalance.add(amount.mul(deposits).mul(numAccounts))
    );
  });

  /*///////////////////////////////////////////////////////////////
                    INVALID BALANCE DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/
  it("Depositing a value more than the user's balance should revert with a 'TRANSFER_FROM_FAILED' error", async () => {
    let amount = ethers.utils.parseEther("100001");

    await expect(
      swellBalancerVault.connect(account1).deposit(amount, account1.address, 0)
    ).to.be.revertedWith("Transfer fail");

    amount = ethers.utils.parseEther("100000.1");
    await expect(
      swellBalancerVault.connect(account1).deposit(amount, account1.address, 0)
    ).to.be.revertedWith("Transfer fail");

    amount = ethers.utils.parseEther("100000.000000001");
    await expect(
      swellBalancerVault.connect(account1).deposit(amount, account1.address, 0)
    ).to.be.revertedWith("Transfer fail");

    amount = ethers.utils.parseEther("100000.000000000000000001");
    await expect(
      swellBalancerVault.connect(account1).deposit(amount, account1.address, 0)
    ).to.be.revertedWith("Transfer fail");
  });

  /*///////////////////////////////////////////////////////////////
                    WITHDRAWL TESTS
    //////////////////////////////////////////////////////////////*/
  it("should return the correct amount of swETH when redeeming shares", async () => {
    const amount = ethers.utils.parseEther("100");
    const estimatedRecovery = await swellBalancerVault
      .connect(account1)
      .previewRedeem(amount);
    const shares = await swellBalancerVault.balanceOf(account1.address);
    const balanceBefore = await swETH.balanceOf(account1.address);
    await swellBalancerVault
      .connect(account1)
      .redeem(amount, account1.address, account1.address, 0);
    expect(await swETH.balanceOf(account1.address)).to.closeTo(
      balanceBefore.add(estimatedRecovery),
      balanceBefore.add(estimatedRecovery).div(100)
    );
    expect(await swellBalancerVault.balanceOf(account1.address)).to.eq(
      shares.sub(amount)
    );
  });

  it("should return the correct amount of swETH when withdrawing assets ", async () => {
    // Deposit into the vault
    const assets = await swellBalancerVault
      .connect(account2)
      .previewRedeem(await swellBalancerVault.balanceOf(account2.address));
    const balanceBefore = await swETH.balanceOf(account2.address);

    await swellBalancerVault
      .connect(account2)
      .withdraw(assets, account2.address, account2.address, 0);
    expect(await swETH.balanceOf(account2.address)).to.be.closeTo(
      balanceBefore.add(assets),
      balanceBefore.add(assets).div(100)
    );
    expect(await swellBalancerVault.balanceOf(account2.address)).to.eq(0);
  });
});
