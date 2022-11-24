// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
   	@title IPeriphery contract
   	@dev Provide interfaces that other contracts can integrate with Periphery contract
*/
interface IPeriphery {

    struct Redeem {
        address membership;
        uint256 memberId;
        uint256 point;
        address voucher;
        uint256 value;
        uint128 nonce;
        uint128 expiry;
    }

    struct Buy {
        address beneficiary;
        address membership;
        uint256 memberId;
        address paymentToken;
        uint256 point;
        uint256 totalPayment;
        uint128 nonce;
        uint128 expiry;
    }

    struct TopUp {
        address beneficiary;
        address membership;
        uint256 memberId;
        address voucher;
        uint256 value;
        address paymentToken;
        uint256 totalPayment;
        uint128 nonce;
        uint128 expiry;
    }

    /**
       	@notice Return corresponding `_loyalty` contract to `_membership` contract
       	@dev  Caller can be ANY
    */
    function getLoyalty(address _membership) external view returns (address);

    /**
       	@notice Checking whether `_membership` contract is disabled
       	@dev  Caller can be ANY
    */
    function disabled(address _membership) external view returns (bool);

    /**
       	@notice Redeem loyalty points to voucher's value
       	@dev  Caller can be ANY
        @param _invoice             Redeem invoice struct
        - membership (address)          Address of Membership contract
        - memberId (uint256)            Member id of `msg.sender`
        - point (uint256)               Amount of point to redeem
        - voucher (address)             Address of Voucher contract to receive a value
        - value (uint256)               Additional value to receive after redemption
        - nonce (uint128)               Current counter of `msg.sender`
        - expiry (uint128)              Expiring time of authorizing signature   
        @param _signature           Authorizing signature provided by Verifier
    */
    function redeem(
        Redeem calldata _invoice,
        bytes calldata _signature
    ) external;

    /**
       	@notice Purchase/Topup voucher's value
       	@dev  Caller can be ANY
        @param _invoice             Topup invoice struct
        - beneficiary (address)         Address of Beneficiary that receives a voucher's value
        - membership (address)          Address of Membership contract
        - memberId (uint256)            Beneficiary's member id
        - voucher (address)             Address of Voucher contract to receive a value
        - value (uint256)               Additional value to receive after topup request
        - paymentToken (address)        Address of payment token (0x00 for Native coin)
        - totalPayment (uint256)        Total payment amount
        - nonce (uint128)               Current counter of `msg.sender`
        - expiry (uint128)              Expiring time of authorizing signature   
        @param _signature           Authorizing signature provided by Verifier
    */
    function topup(
        TopUp calldata _invoice,
        bytes calldata _signature
    ) external payable;

    /**
       	@notice Buy loyaly points
       	@dev  Caller can be ANY
        @param _invoice             Buy invoice struct
        - beneficiary (address)         Address of Beneficiary that receives additional loyalty points
        - membership (address)          Address of Membership contract
        - memberId (uint256)            Beneficiary's member id
        - paymentToken (address)        Address of payment token (0x00 for Native coin)
        - point (uint256)               Additional value to receive after buy request
        - totalPayment (uint256)        Total payment amount
        - nonce (uint128)               Current counter of `msg.sender`
        - expiry (uint128)              Expiring time of authorizing signature   
        @param _signature           Authorizing signature provided by Verifier
    */
    function buy(
        Buy calldata _invoice,
        bytes calldata _signature
    ) external payable;
}
