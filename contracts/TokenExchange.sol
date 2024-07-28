// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenExchange {
    IERC20 token;
    address owner;

    modifier onlyOwner() {
        require(owner == msg.sender);

        _;
    }

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    function buy() public payable {
        uint amount = msg.value; // wei

        require(amount >= 1);

        uint currentBalance = token.balanceOf(address(this));

        require(currentBalance >= amount);

        token.transfer(msg.sender, amount);
    }

    function sell(uint _amount) external {
        require(address(this).balance >= _amount);

        require(token.allowance(msg.sender, address(this)) >= _amount);

        token.transferFrom(msg.sender, address(this), _amount);

        (bool ok, ) = msg.sender.call{value: _amount}("");
        require(ok, "can't send funds");
    }

    function topUp() external payable onlyOwner {

    }

    receive() external payable {
        buy();
    }

}