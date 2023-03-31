task("addWhiteLists", "Add validators to white list").setAction(
  async taskArgs => {
    let network = await ethers.provider.getNetwork();
    console.log("network:", network);

    // Init tag
    const path = `./deployments/${network.chainId}_versions.json`;
    const versions = require("." + path);
    const { validators } = require("../whitelist_validators.json");
    const oldTag = Object.keys(versions)[Object.keys(versions).length - 1];

    const contracts = versions[oldTag].contracts;

    const SWNFTUpgrade = await ethers.getContractFactory("SWNFTUpgrade", {
      libraries: {
        NFTDescriptor: contracts.nftDescriptorLibrary
      }
    });

    const swNFT = await SWNFTUpgrade.attach(contracts.swNFT);

    const res = await swNFT.addWhiteLists(validators);
    console.log(res);
  }
);
