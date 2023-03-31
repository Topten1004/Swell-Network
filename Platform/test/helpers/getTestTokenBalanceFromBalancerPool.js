/**
 *
 * little helper to get the balance of test token in the balancer pool
 *
 * @param balancerVault
 * @param poolId
 * @param testTokenAddress
 * @returns a big number of the test token balance in the balancer pool
 */
const getTestTokenBalanceFromBalancerPool = async (
  balancerVault,
  poolId,
  testTokenAddress
) => {
  const { tokens, balances } = await balancerVault.getPoolTokens(poolId);

  const testTokenPoolIndex = tokens.indexOf(testTokenAddress);
  const tokenPoolBalance = balances[testTokenPoolIndex];

  return tokenPoolBalance;
};

module.exports = {
  getTestTokenBalanceFromBalancerPool,
};
