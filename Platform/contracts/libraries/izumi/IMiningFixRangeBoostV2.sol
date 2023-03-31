// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

// interface implementation of MiningFixRangeBoostV2
// @author https://github.com/izumiFinance/izumi-uniV3Mining/blob/691e847d5d672a3237d236b95ac67a3a0c8e1703/contracts/miningFixRangeBoost/MiningFixRangeBoostV2.sol
interface IMiningFixRangeBoostV2 {
    struct TokenStatus {
        uint256 vLiquidity;
        uint256 validVLiquidity;
        uint256 nIZI;
        uint256 lastTouchBlock;
        uint256 lastTokensOwed0;
        uint256 lastTokensOwed1;
        uint256[] lastTouchAccRewardPerShare;
    }

    function deposit(uint256 tokenId, uint256 nIZI)
        external
        returns (uint256 vLiquidity);

    function withdraw(uint256 tokenId, bool noReward) external;

    function collectReward(uint256 tokenId) external;

    function collectRewards() external;

    function emergenceWithdraw(uint256 tokenId) external;
}
