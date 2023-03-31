const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { extractJSONFromURI } = require("../helpers/extractJSONFromURI");
const { VAULT } = require("../../constants/addresses");
const { createBalancerPool } = require("../helpers/createBalancerPool");
const {
  getLastTagContractFactory,
} = require("../../deploy/swNFTContractFromLastTag");

const pubKey =
  "0xb57e2062d1512a64831462228453975326b65c7008faaf283d5e621e58725e13d10f87e0877e8325c2b1fe754f16b1ec";
const signature =
  "0xb224d558d829c245fe56bff9d28c7fd0d348d6795eb8faef8ce220c3657e373f8dc0a0c8512be589ecaa749fe39fc0371380a97aab966606ba7fa89c78dc1703858dfc5d3288880a813e7743f1ff379192e1f6b01a6a4a3affee1d50e5b3c849";
const depositDataRoot =
  "0x81a814655bfc695f5f207d433b4d2e272d764857fee6efd58ba4677c076e60a9";

// 16 ETH
const pubKey2 =
  "0x8b6819ec8c0a14b8173f3134c18af012d45ba946f07d3d88f2c7787bf79c352f6b7132e14120974103c6ba6f44f00f7f";
const signature2 =
  "0xa16818eec390e04076589ecf2b1b065cd664c9cc791f16b1ad841b7b18727d87b9fbcdc1dbfde7a848b805e71ecd353006b8f1763538fe7946420880dd7d1f4e47a6ec2e6192da30db77349909c944d695a346069d6bce8fe6ee695386840b6e";
const depositDataRoot2 =
  "0xc846f5e5ff1f6748a980747bc00bdfa75c2c2631201561fad976c2e167206e07";

const depositAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
const zeroAddress = "0x0000000000000000000000000000000000000000";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const referralCode = "test-referral";
let swell, swNFT, swETH, wethToken, signer, bot, amount, user, poolId, strategy;

describe("SWNFTUpgrade with BalancerVault", () => {
  before(async () => {
    [signer, user, bot] = await ethers.getSigners();

    const Swell = await ethers.getContractFactory("contracts/SWELL.sol:SWELL");
    swell = await Swell.deploy();
    await swell.deployed();

    console.log("swell deployed", swell.address);

    await getLastTagContractFactory();

    // const SWNFTUpgrade = await ethers.getContractFactory("SWNFTUpgrade");
    const nftDescriptorLibraryFactory = await ethers.getContractFactory(
      "contracts/libraries/NFTDescriptor.sol:NFTDescriptor"
    );
    const nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy();
    const SWNFTUpgrade = await ethers.getContractFactory(
      "contracts/latest-tag/tests/TestswNFTUpgrade.sol:TestswNFTUpgrade",
      {
        libraries: {
          NFTDescriptor: nftDescriptorLibrary.address,
        },
      }
    );

    const oldswNFT = await upgrades.deployProxy(SWNFTUpgrade, [swell.address], {
      kind: "uups",
      initializer: "initialize(address)",
      unsafeAllowLinkedLibraries: true,
    });
    await oldswNFT.deployed();

    const SWNFTUpgradeNew = await ethers.getContractFactory(
      "contracts/tests/TestswNFTUpgrade.sol:TestswNFTUpgrade",
      {
        libraries: {
          NFTDescriptor: nftDescriptorLibrary.address,
        },
      }
    );

    swNFT = await upgrades.upgradeProxy(oldswNFT.address, SWNFTUpgradeNew, {
      kind: "uups",
      libraries: {
        NFTDescriptor: nftDescriptorLibrary.address,
      },
      unsafeAllowLinkedLibraries: true,
    });
    await swNFT.deployed();

    const SWETH = await ethers.getContractFactory("contracts/swETH.sol:SWETH");
    swETH = await SWETH.deploy(swNFT.address);
    await swETH.deployed();
    await swNFT.setswETHAddress(swETH.address);

    // get the test token and wrapped ether contracts
    wethToken = await ethers.getContractAt(
      "contracts/interfaces/IWETH.sol:IWETH",
      wethAddress
    );
    // deposit one thousand ether from the deployer account into the wrapped ether contract
    await wethToken
      .connect(signer)
      .deposit({ value: ethers.utils.parseEther("1000") });
  });

  describe("If not operator", () => {
    it("cannot stake less than 1 Ether", async function () {
      amount = ethers.utils.parseEther("0.1");
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("Min 1 ETH");
    });

    it("Must send 16 ETH bond as first deposit (Operator) and it should not mint any swETH", async function () {
      amount = ethers.utils.parseEther("1");
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("16ETH required");
      amount = ethers.utils.parseEther("16");
      await expect(
        swNFT.stake(
          [
            {
              pubKey: pubKey2,
              signature: signature2,
              depositDataRoot: depositDataRoot2,
              amount,
            },
          ],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.emit(swNFT, "LogStake");

      const tokenURI = await swNFT.tokenURI("1");
      const decodeTokenURI = extractJSONFromURI(tokenURI);
      await expect(decodeTokenURI.name).to.be.equal(
        "Swell Network Validator - swETH - " + pubKey2 + " <> 16 Ether"
      );
      await expect(decodeTokenURI.description).to.be.equal(
        "This NFT represents a liquidity position in a Swell Network Validator. The owner of this NFT can modify or redeem the position.\n" +
          "swETH Address: " +
          swETH.address.toLowerCase() +
          "\n" +
          "Token ID: 1\n\n" +
          "⚠️ DISCLAIMER: Due diligence is imperative when assessing this NFT. Make sure token addresses match the expected tokens, as token symbols may be imitated."
      );

      const owner = await swNFT.ownerOf("1");
      await expect(owner).to.be.equal(signer.address);

      const validatorsLength = await swNFT.validatorsLength();
      const validator = await swNFT.validators("0");
      await expect(validatorsLength).to.be.equal("1");
      await expect(validator).to.be.equal(pubKey2);

      const position = await swNFT.positions("1");
      await expect(position.pubKey).to.be.equal(pubKey2);
      await expect(position.value).to.be.equal("16000000000000000000");
      await expect(position.baseTokenBalance).to.be.equal("0");
      await expect(position.operator).to.be.equal(true);
    });

    it("Validator should be activated for second deposit", async function () {
      amount = ethers.utils.parseEther("16");
      await expect(
        swNFT.stake(
          [
            {
              pubKey: pubKey2,
              signature: signature2,
              depositDataRoot: depositDataRoot2,
              amount,
            },
          ],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("Val inactive");

      // Owner makes the validator active by bot
      await expect(swNFT.updateBotAddress(bot.address))
        .to.emit(swNFT, "LogUpdateBotAddress")
        .withArgs(bot.address);
      const address = await swNFT.botAddress();
      await expect(address).to.be.equal(bot.address);
      await expect(swNFT.connect(bot).updateIsValidatorActive(pubKey2))
        .to.emit(swNFT, "LogUpdateIsValidatorActive")
        .withArgs(bot.address, pubKey2, true);

      // Can stake when validator is activated
      await expect(
        swNFT.connect(user).stake(
          [
            {
              pubKey: pubKey2,
              signature: signature2,
              depositDataRoot: depositDataRoot2,
              amount,
            },
          ],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.emit(swNFT, "LogStake");

      const owner = await swNFT.ownerOf("2");
      await expect(owner).to.be.equal(user.address);

      const validatorsLength = await swNFT.validatorsLength();
      const validator = await swNFT.validators("0");
      await expect(validatorsLength).to.be.equal("1");
      await expect(validator).to.be.equal(pubKey2);

      const position = await swNFT.positions("2");
      await expect(position.pubKey).to.be.equal(pubKey2);
      await expect(position.value).to.be.equal("16000000000000000000");
      await expect(position.baseTokenBalance).to.be.equal(
        "16000000000000000000"
      );
      await expect(position.operator).to.be.equal(false); //whitelist second deposit
    });

    it("creates the balancer pool", async function () {
      await swNFT.connect(user).withdraw("2", ethers.utils.parseEther("10"));
      await swETH
        .connect(user)
        .transfer(signer.address, ethers.utils.parseEther("10"));

      // create a WETH/TEST balancer pool
      poolId = await createBalancerPool(
        signer.address,
        swETH.address,
        wethToken.address
      );
    });

    it("create the strategy", async function () {
      const SwellBalancerVault = await ethers.getContractFactory(
        "contracts/SwellBalancerVault.sol:SwellBalancerVault"
      );
      strategy = await SwellBalancerVault.deploy(
        swETH.address,
        swNFT.address,
        "Test Swell Balancer Vault Token",
        "TSBVT",
        VAULT,
        poolId
      );
      await strategy.deployed();
    });

    it("cannot stake more than 32 Ether", async function () {
      amount = ethers.utils.parseEther("32");
      await expect(
        swNFT.stake(
          [
            {
              pubKey: pubKey2,
              signature: signature2,
              depositDataRoot: depositDataRoot2,
              amount,
            },
          ],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("Over 32 ETH");
    });

    it("cannot withdraw 2 swETH", async function () {
      await expect(
        swNFT.withdraw("1", ethers.utils.parseEther("2"))
      ).to.be.revertedWith("Over balance");

      await expect(
        swNFT.connect(user).withdraw("1", ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Owner only");
    });

    it("can not withdraw with no balance", async function () {
      await expect(
        swNFT.withdraw("1", ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Over balance");

      const position = await swNFT.positions("1");
      await expect(position.pubKey).to.be.equal(pubKey2);
      await expect(position.value).to.be.equal("16000000000000000000");
      await expect(position.baseTokenBalance).to.be.equal("0");
    });

    it("can withdraw 1 swETH", async function () {
      await expect(
        swNFT.connect(user).withdraw("2", ethers.utils.parseEther("1"))
      ).to.emit(swNFT, "LogWithdraw");

      const position = await swNFT.positions("2");
      await expect(position.pubKey).to.be.equal(pubKey2);
      await expect(position.value).to.be.equal("16000000000000000000");
      await expect(position.baseTokenBalance).to.be.equal(
        "5000000000000000000"
      );
    });

    it("cannot deposit if Owner only", async function () {
      await swETH.approve(swNFT.address, ethers.utils.parseEther("2"));
      await expect(
        swNFT.connect(user).deposit("1", ethers.utils.parseEther("2"))
      ).to.be.revertedWith("Owner only");
    });

    it("can deposit 1 swETH", async function () {
      await swETH
        .connect(user)
        .approve(swNFT.address, ethers.utils.parseEther("1"));
      await expect(
        swNFT.connect(user).deposit("2", ethers.utils.parseEther("1"))
      )
        .to.emit(swNFT, "LogDeposit")
        .withArgs("2", user.address, ethers.utils.parseEther("1"));

      const position = await swNFT.positions("2");
      await expect(position.pubKey).to.be.equal(pubKey2);
      await expect(position.value).to.be.equal("16000000000000000000");
      await expect(position.baseTokenBalance).to.be.equal(
        "6000000000000000000"
      );
    });

    it("can add strategy", async function () {
      await expect(swNFT.addStrategy(zeroAddress)).to.be.revertedWith(
        "InvalidAddress"
      );

      await expect(
        swNFT.connect(user).addStrategy(depositAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(swNFT.addStrategy(depositAddress))
        .to.emit(swNFT, "LogAddStrategy")
        .withArgs(depositAddress);
      let strategyAddress = await swNFT.strategies("0");
      await expect(strategyAddress).to.be.equal(depositAddress);

      await expect(swNFT.addStrategy(strategy.address))
        .to.emit(swNFT, "LogAddStrategy")
        .withArgs(strategy.address);
      strategyAddress = await swNFT.strategies(1);
      await expect(strategyAddress).to.be.equal(strategy.address);
    });

    it("can enter strategy", async function () {
      await expect(
        swNFT
          .connect(user)
          .enterStrategy("1", strategy.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Owner only");

      await expect(
        swNFT.enterStrategy("3", strategy.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("ERC721: invalid token ID");

      await expect(
        swNFT
          .connect(user)
          .enterStrategy("2", strategy.address, ethers.utils.parseEther("1"))
      )
        .to.emit(swNFT, "LogEnterStrategy")
        .withArgs(
          "2",
          strategy.address,
          user.address,
          ethers.utils.parseEther("1")
        );

      // await expect(
      //   swNFT.enterStrategy("1", strategy.address, ethers.utils.parseEther("1"))
      // ).to.be.revertedWith("reverted with panic code 0x11");
      await expect(
        swNFT.enterStrategy("1", strategy.address, ethers.utils.parseEther("1"))
      ).to.be.reverted;
    });

    it("can exit strategy", async function () {
      await expect(
        swNFT.exitStrategy(
          "2",
          strategy.address,
          ethers.utils.parseEther("0.5")
        )
      ).to.be.revertedWith("Owner only");

      await expect(
        swNFT
          .connect(user)
          .exitStrategy("2", strategy.address, ethers.utils.parseEther("0.5"))
      )
        .to.emit(swNFT, "LogExitStrategy")
        .withArgs(
          "2",
          strategy.address,
          user.address,
          ethers.utils.parseEther("0.5")
        );

      await expect(
        swNFT.exitStrategy("1", strategy.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Amount too big");
    });

    it("can batch actions", async function () {
      await expect(
        await swNFT.connect(user).batchAction([
          {
            tokenId: "2",
            action: "2",
            amount: ethers.utils.parseEther("1"),
            strategy: strategy.address,
          },
          {
            tokenId: "2",
            action: "3",
            amount: ethers.utils.parseEther("1"),
            strategy: strategy.address,
          },
          {
            tokenId: "2",
            action: "1",
            amount: ethers.utils.parseEther("1"),
            strategy: depositAddress,
          },
        ])
      )
        .to.emit(swNFT, "LogEnterStrategy")
        .withArgs(
          "2",
          strategy.address,
          user.address,
          ethers.utils.parseEther("1")
        )
        .to.emit(swNFT, "LogExitStrategy")
        .withArgs(
          "2",
          strategy.address,
          user.address,
          ethers.utils.parseEther("1")
        )
        .to.emit(swNFT, "LogWithdraw")
        .withArgs("2", user.address, ethers.utils.parseEther("1"));
    });

    it("can remove strategy", async function () {
      await expect(
        swNFT.connect(user).removeStrategy(strategy.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(swNFT.removeStrategy(strategy.address))
        .to.emit(swNFT, "LogRemoveStrategy")
        .withArgs(strategy.address);

      await expect(swNFT.removeStrategy(depositAddress))
        .to.emit(swNFT, "LogRemoveStrategy")
        .withArgs(depositAddress);
    });
  });

  describe("If operator", async () => {
    it("can add validator into whiteList", async () => {
      await expect(await swNFT.addWhiteList(pubKey))
        .to.emit(swNFT, "LogAddWhiteList")
        .withArgs(signer.address, pubKey);
    });

    it("Must send 1 ETH bond as first deposit (Operator)", async function () {
      amount = ethers.utils.parseEther("2");
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("1 ETH required");

      amount = ethers.utils.parseEther("1");
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.emit(swNFT, "LogStake");
    });

    it("Validator should be activated for second deposit", async function () {
      amount = ethers.utils.parseEther("1");
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.be.revertedWith("Val inactive");

      // Owner makes the validator active by bot
      const owner = await swNFT.owner();
      await expect(owner).to.be.equal(signer.address);
      await expect(swNFT.updateBotAddress(bot.address))
        .to.emit(swNFT, "LogUpdateBotAddress")
        .withArgs(bot.address);
      const address = await swNFT.botAddress();
      await expect(address).to.be.equal(bot.address);
      await expect(swNFT.connect(bot).updateIsValidatorActive(pubKey))
        .to.emit(swNFT, "LogUpdateIsValidatorActive")
        .withArgs(bot.address, pubKey, true);

      // Can stake when validator is activated
      await expect(
        swNFT.stake(
          [{ pubKey, signature, depositDataRoot, amount }],
          referralCode,
          {
            value: amount,
          }
        )
      ).to.emit(swNFT, "LogStake");
    });
  });
});
