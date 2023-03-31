const {
  getManifestFile,
  renameManifestForMainEnv,
  restoreManifestForMainEnv,
  upgradeNFTContract,
} = require("./helpers");

task("upgrade", "Upgrade the contracts")
  .addOptionalParam(
    "keepVersion",
    "keep the previous release published version. don't update it",
    false,
    types.boolean
  )
  .setAction(async (taskArgs, hre) => {
    const isMain = hre.network.name.includes("-main");
    const manifestFile = await getManifestFile(hre);
    renameManifestForMainEnv({ isMain, manifestFile });

    try {
      await upgradeNFTContract({
        hre,
        keepVersion: taskArgs.keepVersion,
        multisig: false,
      });
    } catch (e) {
      console.log("error", e);
    } finally {
      restoreManifestForMainEnv({ isMain, manifestFile });
    }
  });

module.exports = {};
