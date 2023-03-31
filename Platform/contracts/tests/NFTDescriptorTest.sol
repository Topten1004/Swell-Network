// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;
// pragma abicoder v2;

import "../libraries/NFTDescriptor.sol";
import "../libraries/NFTSVG.sol";
import "../libraries/HexStrings.sol";

contract NFTDescriptorTest {
    using HexStrings for uint256;

    function addressToString(address _address)
        public
        pure
        returns (string memory)
    {
        return NFTDescriptor.addressToString(_address);
    }

    function generateSVGImage(
        NFTDescriptor.ConstructTokenURIParams memory params
    ) public pure returns (string memory) {
        return NFTDescriptor.generateSVGImage(params);
    }

    function tokenToColorHex(address token, uint256 offset)
        public
        pure
        returns (string memory)
    {
        return NFTDescriptor.tokenToColorHex(uint256(uint160(token)), offset);
    }

    function sliceTokenHex(address token, uint256 offset)
        public
        pure
        returns (uint256)
    {
        return NFTDescriptor.sliceTokenHex(uint256(uint160(token)), offset);
    }
}
