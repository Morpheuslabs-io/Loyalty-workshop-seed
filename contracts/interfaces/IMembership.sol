// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

/**
   	@title IMembership contract
   	@dev Provide interfaces that other contracts can integrate with Membership contract
*/
interface IMembership is IERC721Enumerable {

    /**
       	@notice Add new membership
       	@dev  Caller must be Operator
        @param _account          Account address to be added
        @param _memberId         Assigning member id
    */
    function addMembership(address _account, uint256 _memberId) external;

    /**
       	@notice Cancel current membership
       	@dev  Caller must be Operator
        @param _memberId         Assigning member id
    */
    function cancelMembership(uint256 _memberId) external;

    /**
       	@notice Upgrade `_account` to next tier
       	@dev  Caller must be Operator
        @param _account          Account address to be added
        @param _memberId         Current member id
        @param _nextTier         Upcoming tier will be upgraded

        Note: Checking requiring points, as qualification, could either be done off-chain or on-chain 
    */
    function upgrade(address _account, uint256 _memberId, uint256 _nextTier) external;

    /**
       	@notice Get current `maxTier` of this membership type
       	@dev  Caller can be ANY
    */
    function maxTier() external view returns (uint256);

    /**
       	@notice Get requiring loyalty points per tier
       	@dev  Caller can be ANY
        @param _tierNo       Tier number
    */
    function requirement(uint256 _tierNo) external view returns (uint256);

    /**
       	@notice Get current tier of `_account` with `_memberId`
       	@dev  Caller can be ANY
        @param _account         Account address to query a current tier
        @param _memberId        Member id of `_account`
    */
    function tier(address _account, uint256 _memberId) external view returns (uint256);

    /**
       	@notice Find next tier of `_account` with `_memberId`
       	@dev  Caller can be ANY
        @param _account         Account address to check
        @param _memberId        Member id of `_account`
        @param _balance         Current loyalty point of `_account`

        Note: This function is used by Periphery contract to find next tier
        when `msg.sender` requests to upgrade his/her tier
    */
    function nextTier(address _account, uint256 _memberId, uint256 _balance) external view returns (uint256);
}
