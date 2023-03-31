//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./libraries/ERC4626.sol";
import {FixedPointMathLib} from "./libraries/FixedPointMathLib.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IWeightedPool.sol";
import {WeightedMath} from "./libraries/WeightedMath.sol";
import "./interfaces/ISWNFT.sol";
import "./interfaces/IStrategy.sol";

contract SwellBalancerVault is ERC4626, WeightedMath, IStrategy {
    using FixedPointMathLib for uint256;
    /*///////////////////////////////////////////////////////////////
                               IMMUTABLES
    //////////////////////////////////////////////////////////////*/
    IVault public immutable balancerVault;
    bytes32 public immutable poolId;
    address public immutable swNFT;

    /// @dev The token ID position data
    mapping(uint256 => uint256) public positions;

    constructor(
        ERC20Permit _asset,
        address _swNFT,
        string memory _name,
        string memory _symbol,
        IVault _vault,
        bytes32 _poolId
    ) ERC4626(_asset, _name, _symbol) {
        require(_swNFT != address(0), "InvalidAddress");
        swNFT = _swNFT;

        balancerVault = _vault;
        poolId = _poolId;

        // approve the balancer token vault contract in the asset token contract for this vault
        _asset.approve(address(_vault), type(uint256).max);
    }

    modifier onlyswNFT() {
        require(msg.sender == swNFT, "swNFT only");
        _;
    }

    /*///////////////////////////////////////////////////////////////
                       STRATEGY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Enter vault
    /// @param tokenId The token ID
    /// @param amount The amount of swETH
    /// @return success or not
    function enter(uint256 tokenId, uint256 amount)
        external
        onlyswNFT
        returns (bool success)
    {
        require(amount > 0, "Invalid amount");
        deposit(amount, msg.sender, new bytes(0));
        positions[tokenId] += amount;
        emit LogEnter(tokenId, amount);
        return true;
    }

    /// @notice Exit vault
    /// @param tokenId The token ID
    /// @param amount The amount of swETH
    /// @return success or not
    function exit(uint256 tokenId, uint256 amount)
        external
        onlyswNFT
        returns (bool success)
    {
        require(amount > 0, "No position");
        require(amount <= positions[tokenId], "Amount too big");
        withdraw(amount, msg.sender, msg.sender, new bytes(0));
        positions[tokenId] -= amount;
        emit LogExit(tokenId, amount);
        return true;
    }

    /*///////////////////////////////////////////////////////////////
                       FUNCTION OVERRIDES
    //////////////////////////////////////////////////////////////*/

    function totalAssets()
        public
        view
        override
        returns (uint256 totalManagedAssets)
    {
        (address pool, ) = balancerVault.getPool(poolId);
        uint256 entitlement = ERC20(pool).balanceOf(address(this));
        if (entitlement == 0) {
            return 0;
        }

        // Convert to swETH
        (IERC20[] memory tokens, uint256[] memory balances, ) = balancerVault
            .getPoolTokens(poolId);

        uint256[] memory weights = IWeightedPool(pool).getNormalizedWeights();
        uint256 assetIndex;
        for (uint256 i; i < tokens.length; ++i) {
            if (address(tokens[i]) == address(asset)) {
                assetIndex = i;
                break;
            }
        }

        totalManagedAssets = _calcTokenOutGivenExactBptIn(
            balances[assetIndex],
            weights[assetIndex],
            entitlement,
            ERC20(pool).totalSupply(),
            IWeightedPool(pool).getSwapFeePercentage()
        );
    }

    /*///////////////////////////////////////////////////////////////
                       HOOK OVERRIDES
    //////////////////////////////////////////////////////////////*/
    function beforeWithdraw(
        uint256 assets,
        uint256 shares,
        bytes memory
    ) internal override returns (uint256 assetsRecovered) {
        (address pool, ) = balancerVault.getPool(poolId);

        uint256 bptShareAmount = ERC20(pool).balanceOf(address(this)).mulDivUp(
            shares,
            totalSupply()
        );

        (IERC20[] memory tokens, , ) = balancerVault.getPoolTokens(poolId);

        IAsset[] memory assetList = new IAsset[](tokens.length);
        uint256[] memory amountsOut = new uint256[](tokens.length);
        uint256 exitTokenIndex;
        for (uint256 i; i < tokens.length; i++) {
            assetList[i] = IAsset(address(tokens[i]));
            if (address(tokens[i]) == address(asset)) {
                amountsOut[i] = assets - (assets / 100); // 1% slippage
                exitTokenIndex = i;
            }
        }
        assetsRecovered = asset.balanceOf(address(this));
        balancerVault.exitPool(
            poolId,
            address(this),
            payable(address(this)),
            ExitPoolRequest({
                assets: assetList,
                toInternalBalance: false,
                userData: abi.encode(
                    ExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
                    bptShareAmount,
                    exitTokenIndex
                ),
                minAmountsOut: amountsOut
            })
        );
        assetsRecovered = asset.balanceOf(address(this)) - assetsRecovered;
    }

    function afterDeposit(
        uint256 assets,
        uint256,
        bytes memory
    ) internal override {
        (IERC20[] memory tokensFromPool, , ) = balancerVault.getPoolTokens(
            poolId
        );

        IAsset[] memory tokens = new IAsset[](2);
        uint256[] memory tokenAmounts = new uint256[](2);

        // find the index of the asset token in the tokens from pool array and assign the deposit amount to that index in the tokens amount array
        for (uint256 i = 0; i < tokensFromPool.length; i++) {
            tokens[i] = IAsset(address(tokensFromPool[i]));
            if (address(asset) == address(tokensFromPool[i])) {
                tokenAmounts[i] = assets;
            }
        }

        balancerVault.joinPool(
            poolId,
            address(this),
            address(this),
            JoinPoolRequest(
                tokens,
                tokenAmounts,
                abi.encode(JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, tokenAmounts),
                false
            )
        );
    }
}
