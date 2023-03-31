async function deployMultiSenderContract() {
  const MultiSender = await ethers.getContractFactory("MultiSender");
  const multisender = await MultiSender.deploy();
  await multisender.deployed();
  console.log("multisender:", multisender.address);
  return multisender.address;
}
let multiSendContractAddress;
task("deployMultisender", "Deploy the multisender").setAction(async () => {
  multiSendContractAddress = await deployMultiSenderContract();
});

module.exports = {};
