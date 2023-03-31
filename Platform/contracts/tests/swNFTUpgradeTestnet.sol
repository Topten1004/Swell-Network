//SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.9;

import "../swNFTUpgrade.sol";

contract SWNFTUpgradeTestnet is SWNFTUpgrade {
    function initialize(address _swellAddress, address _depositContract)
        external
        initializer
    {
        require(_swellAddress != address(0), "InvalidAddress");
        require(_depositContract != address(0), "DepositCtr 0");
        __ERC721_init(swNFTName, swNFTSymbol);
        __Ownable_init();
        ETHER = 1e18;
        depositContract = IDepositContract(_depositContract);
        swellAddress = _swellAddress;
    }
}
