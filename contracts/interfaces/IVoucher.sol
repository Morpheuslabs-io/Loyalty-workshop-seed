// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
   	@title IVoucher contract
   	@dev Provide interfaces that other contracts can integrate with Voucher contract
*/
interface IVoucher {
    /**
       	@notice Update voucher's value of `_account`
       	@dev  Caller must be Operator
        @param _account         Account address will be updated voucher's value
        @param _amount          Amount of values will be updated
        @param _isAdded         Boolean flag (Add = True, Deduct = False)
    */
    function updateValue(address _account, uint256 _amount, bool _isAdded) external;
}
