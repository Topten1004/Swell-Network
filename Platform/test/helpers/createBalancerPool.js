const { ethers } = require("hardhat");
const {
  WEIGHTED_POOL_FACTORY,
  ZERO_ADDRESS,
  VAULT,
} = require("../../constants/addresses");

/**
 *
 * little helper that creates a balancer pool instance for wrapped ether and test token
 *
 * @param deployerAddress
 * @param wethTokenContractAddress
 * @param testTokenContractAddress
 * @return the pool id of the created pool
 */
const createBalancerPool = async (
  deployerAddress,
  testTokenContractAddress,
  wethTokenContractAddress
) => {
  // tokens array, NOTE: order matters, needs to be sorted numerically in ascending order
  const tokens = [testTokenContractAddress, wethTokenContractAddress].sort(
    (a, b) => {
      const c = ethers.BigNumber.from(a).sub(ethers.BigNumber.from(b));

      if (c.eq(ethers.BigNumber.from("0"))) {
        return 0;
      } else if (c.gt(ethers.BigNumber.from("1"))) {
        return 1;
      } else {
        return -1;
      }
    }
  );

  // pool arguments
  const poolName = "Wrapped Ether/ Test Token Balancer Pool";
  const poolSymbol = "50WETH-50TEST";
  const swapFeePercentage = ethers.utils.parseEther("0.005"); // 0.5%
  const weights = [
    ethers.utils.parseEther("0.5"),
    ethers.utils.parseEther("0.5"),
  ]; // total weights must add up to one, weight array positions corresponds to the positions of the tokens in the tokens array

  // get the weighted pool factory to be able to create the pool
  const factory = await ethers.getContractAt(
    "contracts/interfaces/IBalancerWeightedPoolFactory.sol:IBalancerWeightedPoolFactory",
    WEIGHTED_POOL_FACTORY
  );

  const poolCreationTx = await factory.create(
    poolName,
    poolSymbol,
    tokens,
    weights,
    swapFeePercentage,
    ZERO_ADDRESS
  );
  const poolCreationReceipt = await poolCreationTx.wait();

  // get the new pool address out of the PoolCreated event
  const poolCreationEvents = poolCreationReceipt.events.filter(
    (e) => e.event === "PoolCreated"
  );
  const poolAddress = poolCreationEvents[0].args.pool;

  // get the pool contract instance and get the pool id for the newly created pool
  const pool = await ethers.getContractAt(
    "contracts/interfaces/IWeightedPool.sol:IWeightedPool",
    poolAddress
  );
  const poolId = await pool.getPoolId();

  // approve the vault (balancer's token vault) contract to transfer tokens for each of the tokens in the tokens array
  const vault = await ethers.getContractAt(
    "contracts/interfaces/IVault.sol:IVault",
    VAULT
  );
  for (let i in tokens) {
    const tokenContract = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      tokens[i]
    );

    await tokenContract.approve(VAULT, ethers.constants.MaxUint256);
  }

  // initial token balances, needs to be in the same order as the tokens in the tokens array
  const initialBalances = [
    ethers.utils.parseEther("10"),
    ethers.utils.parseEther("10"),
  ];

  // construct user data and join request object
  const JOIN_KIND_INIT = 0;
  const initUserData = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint256[]"],
    [JOIN_KIND_INIT, initialBalances]
  );

  const joinPoolRequest = {
    assets: tokens,
    maxAmountsIn: initialBalances,
    userData: initUserData,
    fromInternalBalance: false,
  };

  // join the pool in the vault contract
  await vault.joinPool(
    poolId,
    deployerAddress,
    deployerAddress,
    joinPoolRequest
  );

  // return the pool id
  return poolId;
};

module.exports = {
  createBalancerPool,
};
