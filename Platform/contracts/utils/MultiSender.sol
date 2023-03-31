//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract MultiSender {
    constructor() {}

    event MultiSend(address indexed sender, uint256 value);
    event MultiSendFailure(address indexed recieveFailed);

    function multiSend(address[] calldata addrs) external payable {
        require(msg.value > 0, "No value");
        require(addrs.length > 0);
        uint256 dispatchAmount = msg.value / addrs.length;
        for (uint256 i = 0; i < addrs.length; i++) {
            bool wasSent = payable(addrs[i]).send(dispatchAmount);
            if (!wasSent) emit MultiSendFailure(addrs[i]);
        }
        emit MultiSend(msg.sender, msg.value);
    }

    receive() external payable {}
}
