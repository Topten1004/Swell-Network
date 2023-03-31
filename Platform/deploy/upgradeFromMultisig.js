const {
  getManifestFile,
  renameManifestForMainEnv,
  restoreManifestForMainEnv,
  upgradeNFTContract,
} = require("./helpers");

task("upgradeFromMultisig", "Upgrade the swNFT from multisig wallet")
  .addOptionalParam(
    "keepVersion",
    "keep the previous release published version. don't update it",
    false,
    types.boolean
  )
  .addOptionalParam("nonce", "Manually set nonce", -1, types.int)
  .setAction(async (taskArgs, hre) => {
    let network = await ethers.provider.getNetwork();
    if (network.chainId !== 1 && network.chainId !== 5) {
      console.log("Only available for goerli and mainnet");
      return;
    }

    const isMain = hre.network.name.includes("-main");
    // if Main env, change network manifest file name temporarily
    const manifestFile = getManifestFile(hre);
    renameManifestForMainEnv({ isMain, manifestFile });

    try {
      // Init tag
      await upgradeNFTContract({
        hre,
        keepVersion: taskArgs.keepVersion,
        multisig: true,
        nonce: taskArgs.nonce,
      });
    } catch (e) {
      console.log("error", e);
    } finally {
      restoreManifestForMainEnv({ isMain, manifestFile });
    }
  });

module.exports = {};
