//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./libraries/ERC4626.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {FixedPointMathLib} from "./libraries/FixedPointMathLib.sol";
import {INonfungiblePositionManager} from "./libraries/uniswap/INonfungiblePositionManager.sol";
import {IUniswapV3Pool} from "./libraries/uniswap/IUniswapV3Pool.sol";
import {IUniswapV3SwapRouter} from "./libraries/uniswap/IUniswapV3SwapRouter.sol";
import {FullMath} from "./libraries/uniswap/FullMath.sol";
import {FixedPoint128} from "./libraries/uniswap/FixedPoint128.sol";
import {LiquidityAmounts} from "./libraries/uniswap/LiquidityAmounts.sol";
import {TickMath} from "./libraries/uniswap/TickMath.sol";
import {Babylonian} from "./libraries/uniswap/Babylonian.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IMiningFixRangeBoostV2} from "./libraries/izumi/IMiningFixRangeBoostV2.sol";
import {WeightedMath} from "./libraries/WeightedMath.sol";
import "./interfaces/ISWNFT.sol";
import "./interfaces/IStrategy.sol";

contract SwellIzumiVault is ERC4626, IERC721Receiver, WeightedMath, IStrategy {
    using FixedPointMathLib for uint256;
    using SafeERC20 for IERC20;
    /// Structs
    struct ConstructorParams {
        ERC20Permit asset;
        address swNFT;
        string name;
        string symbol;
        address positionManager;
        address swapRouter;
        UniswapPoolData poolData;
        address IzumiLiquidBox;
    }
    struct UniswapPoolData {
        IUniswapV3Pool pool;
        ERC20Permit counterToken;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidityPerTick;
    }

    /*///////////////////////////////////////////////////////////////
                               IMMUTABLES
    //////////////////////////////////////////////////////////////*/
    INonfungiblePositionManager public immutable positionManager;
    IUniswapV3SwapRouter public immutable swapRouter;
    IMiningFixRangeBoostV2 public immutable liquidBox;
    address public immutable swNFT;
    uint256 public nftID;
    UniswapPoolData public poolData;

    /// @dev The token ID position data
    mapping(uint256 => uint256) public positions;    
    /// Token => balance held in the contract
    mapping(address => uint256) public tokenBalances;

    // checks if nftID is valid
    modifier validTokenId() {
        require(nftID != 0, "Invalid id");
        _;
    }

    modifier validSender(address sender) {
        require(
            sender == address(positionManager.ownerOf(nftID)),
            "Invalid sender"
        );
        _;
    }

    modifier onlyswNFT() {
        require(msg.sender == swNFT, "swNFT only");
        _;
    }


    constructor(ConstructorParams memory _params)
        ERC4626(_params.asset, _params.name, _params.symbol)
    {
        require(_params.swNFT != address(0), "InvalidAddress");
        require(
            _params.positionManager != address(0),
            "Invalid mgr"
        );
        require(_params.swapRouter != address(0), "Invalid router");
        require(address(_params.poolData.pool) != address(0), "Invalid pool");
        require(
            address(_params.poolData.counterToken) != address(0),
            "Invalid token"
        );
        require(_params.poolData.fee > 0, "Invalid fee");
        require(
            _params.poolData.tickLower < _params.poolData.tickUpper,
            "Inv tick range"
        );
        require(_params.IzumiLiquidBox != address(0), "Invalid addr");

        swNFT = _params.swNFT;
        positionManager = INonfungiblePositionManager(_params.positionManager);
        swapRouter = IUniswapV3SwapRouter(_params.swapRouter);
        poolData = _params.poolData;
        liquidBox = IMiningFixRangeBoostV2(_params.IzumiLiquidBox);

        IERC20(address(_params.poolData.counterToken)).safeIncreaseAllowance(
            _params.positionManager,
            type(uint256).max
        );

        IERC20(address(_params.asset)).safeIncreaseAllowance(
            _params.positionManager,
            type(uint256).max
        );
        IERC20(address(_params.poolData.counterToken)).safeIncreaseAllowance(
            address(_params.poolData.pool),
            type(uint256).max
        );
        IERC20(address(_params.asset)).safeIncreaseAllowance(
            address(_params.poolData.pool),
            type(uint256).max
        );
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
        if (nftID == 0) {
            return 0;
        }

        (
            ,
            ,
            address token0,
            address token1,
            ,
            ,
            ,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        ) = positionManager.positions(nftID);

        UniswapPoolData memory position = poolData;

        uint256 amount0 = uint256(tokensOwed0) +
            _getTokenXOwed(
                position.pool.feeGrowthGlobal0X128(),
                feeGrowthInside0LastX128,
                liquidity,
                ERC20(token0).decimals()
            ) +
            tokenBalances[token0];
        uint256 amount1 = uint256(tokensOwed1) +
            _getTokenXOwed(
                position.pool.feeGrowthGlobal1X128(),
                feeGrowthInside1LastX128,
                liquidity,
                ERC20(token1).decimals()
            ) +
            tokenBalances[token1];

        totalManagedAssets = _getEstimatedValue(
            position.tickLower,
            position.tickUpper,
            liquidity,
            address(asset) == token0 ? amount1 : amount0,
            address(asset) == token0
        );
    }

    function _getTokenXOwed(
        uint256 feeGrowthGlobal,
        uint256 feeGrowthInside,
        uint128 liquidity,
        uint256 decimal
    ) internal pure returns (uint256 tokenXOwed) {
        tokenXOwed =
            (
                FullMath.mulDiv(
                    feeGrowthGlobal - feeGrowthInside,
                    liquidity,
                    FixedPoint128.Q128
                )
            ) /
            (10**decimal);
    }

    /// @notice Returns estimated value of a position, including fees earned.
    /// @param tickLower The position's lower tick
    /// @param tickUpper The position's upper tick
    /// @param onsideLiquidity The amount of liquidity in the position
    /// @param offsideAmount The amount of offside tokens to convert onside
    /// @param assetIsToken0 Is the onside token is equal to position.token0
    /// @return totalValue the position's total value in a single asset
    function _getEstimatedValue(
        int24 tickLower,
        int24 tickUpper,
        uint128 onsideLiquidity,
        uint256 offsideAmount,
        bool assetIsToken0
    ) internal pure returns (uint256 totalValue) {
        uint160 sqrtLower = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtUpper = TickMath.getSqrtRatioAtTick(tickUpper);
        uint128 totalLiquidity = onsideLiquidity;

        if (assetIsToken0) {
            totalLiquidity += LiquidityAmounts.getLiquidityForAmount0(
                sqrtLower,
                sqrtUpper,
                offsideAmount
            );
            totalValue = LiquidityAmounts.getAmount0ForLiquidity(
                sqrtLower,
                sqrtUpper,
                totalLiquidity
            );
        } else {
            totalLiquidity += LiquidityAmounts.getLiquidityForAmount1(
                sqrtLower,
                sqrtUpper,
                offsideAmount
            );
            totalValue = LiquidityAmounts.getAmount1ForLiquidity(
                sqrtLower,
                sqrtUpper,
                totalLiquidity
            );
        }
    }

    /*///////////////////////////////////////////////////////////////
                       HOOK OVERRIDES
    //////////////////////////////////////////////////////////////*/
    struct SwapParams {
        uint256 amountIn;
        address tokenIn;
        address tokenOut;
        uint24 fee;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimit;
    }

    function _swapTokens(SwapParams memory data)
        internal
        returns (uint256 amountOut)
    {
        amountOut = swapRouter.exactInputSingle(
            IUniswapV3SwapRouter.ExactInputSingleParams({
                tokenIn: data.tokenIn,
                tokenOut: data.tokenOut,
                fee: data.fee,
                recipient: address(this),
                amountIn: data.amountIn,
                amountOutMinimum: data.amountOutMinimum,
                sqrtPriceLimitX96: data.sqrtPriceLimit
            })
        );
    }

    function _swapTokenFromTo(
        uint256 amountIn,
        uint256 amountOutMin,
        uint160 sqrtPriceLimit,
        address inputToken,
        address outputToken
    ) internal returns (uint256 amountOut) {
        if (address(asset) == inputToken) {
            IERC20(address(asset)).safeIncreaseAllowance(
                address(swapRouter),
                amountIn
            );
        } else {
            IERC20(address(poolData.counterToken)).safeIncreaseAllowance(
                address(swapRouter),
                amountIn
            );
        }
        amountOut = _swapTokens(
            SwapParams({
                amountIn: amountIn,
                tokenIn: inputToken,
                tokenOut: outputToken,
                fee: poolData.fee,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimit: sqrtPriceLimit
            })
        );
    }

    function _getMinimum(uint256 amountDesired)
        internal
        pure
        returns (uint256 amountMinimum)
    {
        amountMinimum = (amountDesired / 100) * 3;
    }

    function afterDeposit(
        uint256 assets,
        uint256,
        bytes memory params
    ) internal override {
        (uint256 amountIn, uint256 amountOutMin, uint160 sqrtPriceLimit) = abi
            .decode(params, (uint256, uint256, uint160));

        require(amountIn != 0, "amountIn 0");
        require(amountOutMin != 0, "amountOutMin 0");
        require(sqrtPriceLimit != 0, "priceLimit 0");

        UniswapPoolData memory position = poolData;
        (address token0, address token1) = _canonicalTokenSort(
            address(asset),
            address(position.counterToken)
        );

        bool assetIsToken0 = address(asset) == token0;

        uint256 token0Before = assetIsToken0
            ? tokenBalances[token0] + assets
            : tokenBalances[token0];
        uint256 token1Before = assetIsToken0
            ? tokenBalances[token1]
            : tokenBalances[token1] + assets;

        // Withdraw from izumi liquidbox if nft exists but is staked.
        if (nftID != 0 && positionManager.ownerOf(nftID) == address(liquidBox))
            withdrawFromLiquidBox(true);

        if (assetIsToken0) {
            token1Before += _swapTokenFromTo(
                amountIn,
                amountOutMin,
                sqrtPriceLimit,
                token0,
                token1
            );
            token0Before -= amountIn;
        } else {
            token0Before += _swapTokenFromTo(
                amountIn,
                amountOutMin,
                sqrtPriceLimit,
                token1,
                token0
            );
            token1Before -= amountIn;
        }

        if (nftID == 0) {
            (
                uint256 newTokenId,
                ,
                uint256 amount0,
                uint256 amount1
            ) = positionManager.mint(
                    INonfungiblePositionManager.MintParams({
                        token0: token0,
                        token1: token1,
                        fee: position.fee,
                        tickLower: position.tickLower,
                        tickUpper: position.tickUpper,
                        amount0Desired: token0Before,
                        amount1Desired: token1Before,
                        amount0Min: _getMinimum(token0Before),
                        amount1Min: _getMinimum(token1Before),
                        recipient: address(this),
                        deadline: block.timestamp
                    })
                );
            nftID = newTokenId;
            tokenBalances[token0] = token0Before - amount0;
            tokenBalances[token1] = token1Before - amount1;
        } else {
            (, uint256 amount0, uint256 amount1) = positionManager
                .increaseLiquidity(
                    INonfungiblePositionManager.IncreaseLiquidityParams({
                        tokenId: nftID,
                        amount0Desired: token0Before,
                        amount1Desired: token1Before,
                        amount0Min: _getMinimum(token0Before),
                        amount1Min: _getMinimum(token1Before),
                        deadline: block.timestamp
                    })
                );

            tokenBalances[token0] = token0Before - amount0;
            tokenBalances[token1] = token1Before - amount1;
        }

        // Deposit nft to liquidbox
        depositToLiquidBox();
    }

    function beforeWithdraw(
        uint256 assets,
        uint256,
        bytes memory params
    ) internal override validTokenId returns (uint256 assetsRecovered) {
        (uint256 amountIn, uint256 amountOutMin, uint160 sqrtPriceLimit) = abi
            .decode(params, (uint256, uint256, uint160));

        require(amountIn != 0, "amountIn 0");
        require(amountOutMin != 0, "amountOutMin 0");
        require(sqrtPriceLimit != 0, "priceLimit 0");

        (address token0, address token1) = _canonicalTokenSort(
            address(asset),
            address(poolData.counterToken)
        );

        bool assetIsToken0 = address(asset) == token0;

        uint256 token0Before = tokenBalances[token0];
        uint256 token1Before = tokenBalances[token1];

        if (assetIsToken0 && token0Before >= assets) {
            tokenBalances[token0] = token0Before - assets;
            return assets;
        } else if (!assetIsToken0 && token1Before >= assets) {
            tokenBalances[token1] = token1Before - assets;
            return assets;
        }

        // Decrease liquidity. Below has been scoped to avoid the "stack too deep" error.
        {
            uint256 assetsToWithdraw = assets;
            uint128 requiredLiquidity = getRequiredLiquidity(
                assetsToWithdraw,
                assetIsToken0
            );
            (, , , , , , , uint128 liquidity, , , , ) = positionManager
                .positions(nftID);
            require(requiredLiquidity <= liquidity, "No liquidity");

            // Withdraw LP NFT from liquidbox after checking there is enough liquidity
            withdrawFromLiquidBox(false);

            (
                uint256 amount0Required,
                uint256 amount1Required
            ) = getAmountsRequired(requiredLiquidity);
            positionManager.decreaseLiquidity(
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: nftID,
                    liquidity: requiredLiquidity,
                    amount0Min: amount0Required,
                    amount1Min: amount1Required,
                    deadline: block.timestamp
                })
            );
        }
        (uint256 collectAmount0, uint256 collectAmount1) = positionManager
            .collect(
                INonfungiblePositionManager.CollectParams({
                    tokenId: nftID,
                    recipient: address(this),
                    amount0Max: type(uint128).max,
                    amount1Max: type(uint128).max
                })
            );
        token0Before += collectAmount0;
        token1Before += collectAmount1;

        // Deposits to liquid box
        depositToLiquidBox();

        if (assetIsToken0) {
            token0Before += _swapTokenFromTo(
                amountIn,
                amountOutMin,
                sqrtPriceLimit,
                token1,
                token0
            );
            if (assets > token0Before) {
                tokenBalances[token0] = 0;
                tokenBalances[token1] = token1Before - amountIn;
                return token0Before;
            }
            token0Before -= assets;
            token1Before -= amountIn;

            tokenBalances[token0] = token0Before;
            tokenBalances[token1] = token1Before;
            return assets;
        } else {
            token1Before += _swapTokenFromTo(
                amountIn,
                amountOutMin,
                sqrtPriceLimit,
                token0,
                token1
            );
            if (assets > token1Before) {
                tokenBalances[token1] = 0;
                tokenBalances[token0] = token0Before - amountIn;
                return token0Before;
            }
            token1Before -= assets;
            token0Before -= amountIn;

            tokenBalances[token1] = token1Before;
            tokenBalances[token0] = token0Before;
            return assets;
        }
    }

    function _canonicalTokenSort(address tokenA, address tokenB)
        internal
        pure
        returns (address token0, address token1)
    {
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
    }

    function getAmountsRequired(uint128 requiredLiquidity)
        public
        view
        returns (uint256 amount0Required, uint256 amount1Required)
    {
        UniswapPoolData memory position = poolData;
        (uint160 sqrtPriceX96, , , , , , ) = position.pool.slot0();
        (amount0Required, amount1Required) = LiquidityAmounts
            .getAmountsForLiquidity(
                sqrtPriceX96,
                TickMath.getSqrtRatioAtTick(position.tickLower),
                TickMath.getSqrtRatioAtTick(position.tickUpper),
                requiredLiquidity
            );
    }

    function getRequiredLiquidity(uint256 assets, bool assetIsToken0)
        public
        view
        returns (uint128 requiredLiquidity)
    {
        UniswapPoolData memory position = poolData;
        if (assetIsToken0) {
            requiredLiquidity = LiquidityAmounts.getLiquidityForAmount0(
                TickMath.getSqrtRatioAtTick(position.tickLower),
                TickMath.getSqrtRatioAtTick(position.tickUpper),
                assets
            );
        } else {
            requiredLiquidity = LiquidityAmounts.getLiquidityForAmount1(
                TickMath.getSqrtRatioAtTick(position.tickLower),
                TickMath.getSqrtRatioAtTick(position.tickUpper),
                assets
            );
        }
    }

    function depositToLiquidBox()
        internal
        validTokenId
        validSender(address(this))
        returns (uint256)
    {
        positionManager.approve(address(liquidBox), nftID);
        return liquidBox.deposit(nftID, 0);
    }

    function withdrawFromLiquidBox(bool noRewards)
        internal
        validTokenId
        validSender(address(liquidBox))
    {
        liquidBox.withdraw(nftID, noRewards);
    }

    /// Used for ERC721 safeTransferFrom
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
