// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";

abstract contract ERC20Burnable is ERC20 {

    function burn(uint256 value) public virtual {
        _burn(msg.sender, value);
    }

    function burnFrom(address count, uint256 value) public virtual {
        _spendAllowance(count, msg.sender, value);

        _burn(count, value);
    }
}