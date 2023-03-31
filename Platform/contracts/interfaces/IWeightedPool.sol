//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

interface IWeightedPool {
    function getPoolId() external view returns (bytes32);

    function getNormalizedWeights() external view returns (uint256[] memory);

    function getSwapFeePercentage() external view returns (uint256);
}
