// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
   	@title ILoyalty contract
   	@dev Provide an interface that other contracts can integrate with Loyalty contract
*/
interface ILoyalty is IERC20 {
    /**
       	@notice Update loyalty points of `_account`
       	@dev  Caller must be Operator
        @param _account         Account address will be updated loyalty points
        @param _amount          Amount of points will be updated
        @param _isAdded         Boolean flag (Add = True, Deduct = False)
    */
    function updatePoint(address _account, uint256 _amount, bool _isAdded) external;
}
