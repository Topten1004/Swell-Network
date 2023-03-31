async function deployDepositContract() {
  const DepositContract = await ethers.getContractFactory("DepositContract");
  depositContract = await DepositContract.deploy();
  await depositContract.deployed();
  console.log("depositContract:", depositContract.address);
  return depositContract.address;
}

async function deploySWNFTUpgradeTestnet(swellAddress, depositContractAddress) {
  const nftDescriptorLibraryFactory = await ethers.getContractFactory(
    "NFTDescriptor"
  );
  const nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy();
  console.log("nftDescriptorLibrary:", nftDescriptorLibrary.address);

  const SWNFTUpgradeTestnet = await ethers.getContractFactory(
    "SWNFTUpgradeTestnet",
    {
      libraries: {
        NFTDescriptor: nftDescriptorLibrary.address
      }
    }
  );
  swNFT = await upgrades.deployProxy(
    SWNFTUpgradeTestnet,
    [swellAddress, depositContractAddress],
    {
      kind: "uups",
      initializer: "initialize(address,address)",
      unsafeAllowLinkedLibraries: true
    }
  );
  return { swNFT, nftDescriptorLibrary };
}

module.exports = {
  deployDepositContract,
  deploySWNFTUpgradeTestnet
};
