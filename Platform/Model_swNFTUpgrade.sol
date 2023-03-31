// - Does not implement enterStrategy()/exitStrategy() for now
// - Does not consider whiteList
// - Uses real numbers
contract swNFTUpgrade {
	struct Position {
		BLSPublicKey pubKey;
		num stakingAmount;
		num swETHBalance;
		num validatorBalance;
		num rewardsMinted; // Sum of all swETH that has been minted for this position as rewards
		bool operator;
	}

	mapping(BLSPublicKey => num) validatorDeposits;
	mapping(swNFTTokenID => Position) positions;

	swETH swETH_Token;
	swNFT swNFT_Token;
	address feePool; // Address to which collected fees are transferred

	BeaconChainOracle beaconOracle;
	IDepositContract depositContract;


	function stake(
		BLSPublicKey pubKey,
		num amount,
		bytes signature
	) {
		require(amount >= 1 ether, "Must be at least 1 ETH");
		require(amount % 1 ether == 0, "Must be a multiple of 1 ETH");

		bool isFirstDeposit = validatorDeposits[pubKey] == 0;
		require(!isFirstDeposit || amount >= 16 ether, "Node operators must deposit at least ETH");

		depositContract.deposit(
			pubKey,
			amount,
			getWithdrawalCredentials(),
			signature
		);
		validatorDeposits[pubKey] += amount;

		// Mint swETH
		num swETHAmount = isFirstDeposit ? 0 : amount;
		swETH_Token.mint(this, swETHAmount);

		// Mint an swNFT token for the staker
		swNFTTokenID nft = swNFT_Token.mintFor(msg.sender);
		positions[nft] = Position({
			pubKey: pubKey,
			stakingAmount: amount,
			swETHBalance: swETHAmount,
			validatorBalance: 32 ether,
			rewardsMinted: 0,
			operator: isFirstDeposit,
		});

		return nft;
	}


	function deposit(swNFTTokenID nft, num amount) {
		require(swNFT_Token.ownerOf(nft) == msg.sender);

		positions[nft].swETHBalance += amount;
		swETH_Token.transfer(msg.sender, this, amount);
	}


	function withdraw(swNFTTokenID nft, num amount) {
		require(swNFT_Token.ownerOf(nft) == msg.sender);
		require(positions[nft].swETHBalance >= amount);

		positions[nft].swETHBalance -= amount;
		swETH_Token.transfer(this, msg.sender, amount);
	}


	// Mint swETH for rewards earned on Beacon Chain and transfer them to the swNFT
	function collectRewards(swNFTTokenID nft) {
		require(swNFT_Token.ownerOf(nft) == msg.sender);

		Position p = positions[nft];

		// Compute rewards the validator has earned since the user started staking
		num activeBalanceNow = beaconOracle.getValidatorBalance(p.pubKey);
		num validatorRewards = max(0, activeBalanceNow - p.validatorBalance);

		// Compute the user's share of the rewards
		num userRewards = validatorRewards * (p.stakingAmount / 32 ether); // Total staking amount is always 32
		num fee = p.operator ? 0 : FEE; // TODO Do node operators also need to pay a fee?
		num feeAmount = userRewards * fee;
		num actualUserRewards = userRewards - feeAmount;

		// Mint swETH for rewards
		swETH_Token.mint(this, userRewards);
		swETH_Token.transfer(this, feePool, feeAmount);
		p.rewardsMinted += userRewards;
		p.swETHBalance += actualUserRewards;

		p.validatorBalance = activeBalanceNow;
	}


	// For simplicity, this function only pays out the rewards in swETH, never in ETH. To get ETH,
	// use redeem() after unstake().
	function unstake(swNFTTokenID nft) {
		require(swNFT_Token.ownerOf(nft) == msg.sender, "Only owner of swNFT can unstake");
		require(!positions[nft].operator, "Staking position not by staker");

		collectRewards(nft);

		// Transfer all swETH contained in the swNFT to user
		swETH_Token.transfer(this, msg.sender, positions[nft].swETHBalance);
		positions[nft].swETHBalance = 0;

		// If the validator has exited the Beacon Chain, we burn the swNFT.
		// Otherwise, we transfer ownership to the contract so that someone else can buy it.
		if(beaconOracle.validatorHasExited(positions[nft].pubKey)) {
			delete positions[nft];
			swNFT_Token.burn(nft);
		}
		else {
			swNFT_Token.transfer(msg.sender, this, nft);
		}
	}


	// For simplicity, this function only pays out the rewards in swETH, never in ETH. To get ETH,
	// use redeem() after unstake().
	function unstakeNodeOperator(swNFTToken nft) {
		require(swNFT_Token.ownerOf(nft) == msg.sender, "Only owner of swNFT can unstake");

		Position p = positions[nft];

		require(p.operator, "Staking position not by node operator");
		require(isWithdrawable(p.pubKey), "Node operator may only unstake once validator stake is withdrawable");

		require(!!! TODO !!!, "Node operator must unstake last");

		num swETH_minted_initially = 32 ether - p.stakingAmount;
		num swETH_minted_total = swETH_minted_initially + rewardsMintedForValidator(p.pubKey);
		num activeBalanceNow = beaconOracle.getValidatorBalance(p.pubKey);
		require(swETH_minted_total <= activeBalanceNow, "Not all minted swETH is backed by ETH");

		num swETH_unminted = activeBalanceNow - swETH_minted_total;
		swETH_Token.mint(msg.sender, swETH_unminted);
		swETH_Token.transfer(this, msg.sender, p.swETHBalance);

		// Burn swNFT
		delete positions[nft];
		swNFT_Token.burn(nft);
	}


	function swap(swNFTTokenID nft) {
		require(swNFT_Token.ownerOf(nft) == this);

		Position p = positions[nft];

		swETH_Token.transfer(msg.sender, this, p.stakingAmount);
		p.swETHBalance = p.stakingAmount;

		swNFTTokenID.transfer(this, msg.sender, nft);
	}


	function redeem(num amount) {
		require(swETH_Token.balanceOf(this) >= amount, "Not enough ETH available");

		// Burn swETH
		swETH_Token.transfer(msg.sender, this, amount);
		swETH_Token.burn(amount);

		// Transfer ETH
		msg.sender.transfer(amount);
	}


	function rewardsMintedForValidator(BLSPublicKey pubKey) {
		return Σ nft ∈ nftsFor(pubKey): positions[nft].rewardsMinted;
	}
}
