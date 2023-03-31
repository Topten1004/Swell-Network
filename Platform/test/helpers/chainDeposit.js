/**
 *
 * little helper to deposit into the balancer vault contract multiple times
 *
 * @param balancerVault: a deployed instance of the balancer vault contract
 * @param deposits: the number of times to deposit
 * @param amount: a bigNumber of the amount to deposit
 * @param signer: the account making the deposit
 */
const chainDeposit = async (balancerVault, deposits, amount, signer) => {
  for (let i = 0; i < deposits; i++) {
    await balancerVault.connect(signer).deposit(amount, signer.address, 0);
  }
};

module.exports = {
  chainDeposit,
};
