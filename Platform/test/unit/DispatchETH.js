const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dispatch Test ETH", () => {
  let signer, user1, MultiSender, multisender;
  before(async () => {
    [signer, user1] = await ethers.getSigners();
    MultiSender = await ethers.getContractFactory(
      "contracts/utils/MultiSender.sol:MultiSender"
    );
    multisender = await MultiSender.deploy();
    await multisender.deployed();
  });
  it("Should transfer ETH", async () => {
    const val = ethers.utils.parseEther("10");
    const data = [user1.address];
    await expect(multisender.connect(signer).multiSend(data, { value: val }))
      .to.emit(multisender, "MultiSend")
      .withArgs(signer.address, val);
  });
});
