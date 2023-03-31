//SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.9;

import "../swNFTUpgrade.sol";

contract TestswNFTUpgrade is SWNFTUpgrade {
    function getWithdrawalCredentials() public override pure returns (bytes memory) {
        return abi.encodePacked(bytes1(0x01), bytes11(0x0), 0x00000000219ab540356cBB839Cbe05303d7705Fa);
    }
}
