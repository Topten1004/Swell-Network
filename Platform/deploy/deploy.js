const fs = require("fs");
const { networkNames } = require("@openzeppelin/upgrades-core");
const { getTag, getImplementation, tryVerify  } = require("./helpers");
const {
  deployDepositContract,
  deploySWNFTUpgradeTestnet,
} = require("./deployTestnet");
const goerliDepositContract = "0xff50ed3d0ec03ac01d4c79aad74928bff48a7b2b";
const kilnDepositContract = "0x4242424242424242424242424242424242424242";
let depositContractAddress, swNFT, nftDescriptorLibrary;
const pubKey =
  "0xb57e2062d1512a64831462228453975326b65c7008faaf283d5e621e58725e13d10f87e0877e8325c2b1fe754f16b1ec";

task("deploy", "Deploy the contracts")
  .addOptionalParam(
    "keepVersion",
    "keep the previous release published version. don't update it",
    false,
    types.boolean
  )
  .setAction(async (taskArgs, hre) => {
    const isMain = hre.network.name.includes("-main");

    let network = await ethers.provider.getNetwork();
    console.log("network:", network);
    // if Main env, change network manifest file name temporarily
    const manifestFile = networkNames[network.chainId]
      ? networkNames[network.chainId]
      : `unknown-${network.chainId}`;

    if (isMain) {
      if (fs.existsSync(`.openzeppelin/${manifestFile}.json`)) {
        fs.renameSync(
          `.openzeppelin/${manifestFile}.json`,
          `.openzeppelin/${manifestFile}-orig.json`
        );
      }
      if (fs.existsSync(`.openzeppelin/${manifestFile}-main.json`)) {
        fs.renameSync(
          `.openzeppelin/${manifestFile}-main.json`,
          `.openzeppelin/${manifestFile}.json`
        );
      }
    }

    try {
      // Init tag
      const path = `./deployments/${network.chainId}_versions${isMain ? "-main" : ""
        }.json`;
      const versions = require("." + path);

      const oldTag = Object.keys(versions)[Object.keys(versions).length - 1];
      let newTag;
      if (taskArgs.keepVersion) {
        newTag = oldTag;
      } else {
        // update to latest release version
        newTag = await getTag();
      }
      console.log(`Old Version: ${oldTag}`);
      console.log(`New Version: ${newTag}`);

      // const contracts = versions[oldTag].contracts;
      versions[newTag] = new Object();
      // versions[newTag].contracts = { ...contracts };
      versions[newTag].contracts = new Object();
      versions[newTag].network = network;
      versions[newTag].date = new Date().toUTCString();

      if (network.chainId === 2077117572) {
        depositContractAddress = await deployDepositContract();
        versions[newTag].contracts.depositContractAddress =
          depositContractAddress;
      }

      const SWDAO = await ethers.getContractFactory("SWELL");
      const swDAO = await SWDAO.deploy();
      await swDAO.deployed();
      console.log("SWELL:", swDAO.address);
      versions[newTag].contracts.SWELL = swDAO.address;

      switch (network.chainId) {
        case 5:
          ({ swNFT, nftDescriptorLibrary } = await deploySWNFTUpgradeTestnet(
            swDAO.address,
            goerliDepositContract
          ));
          break;
        case 1337802:
          ({ swNFT, nftDescriptorLibrary } = await deploySWNFTUpgradeTestnet(
            swDAO.address,
            kilnDepositContract
          ));
          break;
        case 2077117572:
          ({ swNFT, nftDescriptorLibrary } = await deploySWNFTUpgradeTestnet(
            swDAO.address,
            depositContractAddress
          ));
          break;
        default:
          const nftDescriptorLibraryFactory = await ethers.getContractFactory(
            "NFTDescriptor"
          );
          nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy();
          console.log("nftDescriptorLibrary:", nftDescriptorLibrary.address);

          const SWNFTUpgrade = await ethers.getContractFactory("SWNFTUpgrade", {
            libraries: {
              NFTDescriptor: nftDescriptorLibrary.address,
            },
          });
          swNFT = await upgrades.deployProxy(SWNFTUpgrade, [swDAO.address], {
            kind: "uups",
            libraries: {
              NFTDescriptor: nftDescriptorLibrary.address,
            },
            unsafeAllowLinkedLibraries: true,
          });
      }
      await swNFT.deployed();
      console.log("swNFT:", swNFT.address);
      await swNFT.addWhiteList(pubKey);
      versions[newTag].contracts.nftDescriptorLibrary =
        nftDescriptorLibrary.address;
      versions[newTag].contracts.swNFT = swNFT.address;

      const SWETH = await ethers.getContractFactory("SWETH");
      const swETH = await SWETH.deploy(swNFT.address);
      await swETH.deployed();
      await swNFT.setswETHAddress(swETH.address);
      console.log("swETH:", swETH.address);
      versions[newTag].contracts.swETH = swETH.address;

      const Strategy = await ethers.getContractFactory("Strategy");
      const strategy = await Strategy.deploy(swNFT.address);
      await strategy.deployed();
      console.log("strategy:", strategy.address);
      versions[newTag].contracts.strategy = strategy.address;

      await swNFT.addStrategy(strategy.address);

      const swNFTImplementation = await getImplementation(swNFT.address, hre);
      await tryVerify(hre, swNFTImplementation, "contracts/swNFTUpgrade.sol:SWNFTUpgrade", []);

      // convert JSON object to string
      const data = JSON.stringify(versions, null, 2);

      // write to version file
      fs.writeFileSync(path, data);
    } catch (e) {
      console.log("error", e);
    } finally {
      if (isMain) {
        // restore network manifest file
        if (fs.existsSync(`.openzeppelin/${manifestFile}.json`)) {
          fs.renameSync(
            `.openzeppelin/${manifestFile}.json`,
            `.openzeppelin/${manifestFile}-main.json`
          );
        }

        if (fs.existsSync(`.openzeppelin/${manifestFile}-orig.json`)) {
          fs.renameSync(
            `.openzeppelin/${manifestFile}-orig.json`,
            `.openzeppelin/${manifestFile}.json`
          );
        }
      }
    }
  });

module.exports = {};
