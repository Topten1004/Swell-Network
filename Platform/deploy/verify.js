const { getImplementation, tryVerify } = require("./helpers");

task("Verify", "Verify the swNFTImplementation contract")
  .setAction(async (taskArgs, hre) => {
    const isMain = hre.network.name.includes("-main");

    let network = await ethers.provider.getNetwork();

    try {
      // Init tag
      const path = `./deployments/${network.chainId}_versions${isMain ? "-main" : ""
        }.json`;
      const versions = require("." + path);
      const latest = Object.keys(versions)[Object.keys(versions).length - 1];
      const contracts = versions[latest].contracts;

      const swNFTImplementation = await getImplementation(contracts.swNFT, hre);
      await tryVerify(hre, swNFTImplementation, "contracts/swNFTUpgrade.sol:SWNFTUpgrade", []);
    } catch (e) {
      console.log("error", e);
    }
  });

module.exports = {};
