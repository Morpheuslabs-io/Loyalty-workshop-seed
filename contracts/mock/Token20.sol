// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token20 is ERC20 {
    uint8 private _decimals_;

    constructor(uint8 decimals_) ERC20("Tether USD", "USDT") {
        _decimals_ = decimals_;
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function decimals() public view override returns (uint8) {
        return _decimals_;
    }
}
