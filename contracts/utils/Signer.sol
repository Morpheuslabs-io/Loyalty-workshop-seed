// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IPeriphery.sol";

contract Signer is EIP712 {
    using ECDSA for bytes32;
    bytes32 private constant _BUY =
        keccak256("Buy(address beneficiary,address membership,uint256 memberId,address paymentToken,uint256 point,uint256 totalPayment,uint128 nonce,uint128 expiry)");
    bytes32 private constant _BUY_ACTION = 
        keccak256("BuyAction(address caller,Buy data)Buy(address beneficiary,address membership,uint256 memberId,address paymentToken,uint256 point,uint256 totalPayment,uint128 nonce,uint128 expiry)");
    bytes32 private constant _REDEEM =
        keccak256("Redeem(address membership,uint256 memberId,uint256 point,address voucher,uint256 value,uint128 nonce,uint128 expiry)");
    bytes32 private constant _REDEEM_ACTION =
        keccak256("RedeemAction(address caller,Redeem data)Redeem(address membership,uint256 memberId,uint256 point,address voucher,uint256 value,uint128 nonce,uint128 expiry)");
    bytes32 private constant _TOPUP =
        keccak256("TopUp(address beneficiary,address membership,uint256 memberId,address voucher,uint256 value,address paymentToken,uint256 totalPayment,uint128 nonce,uint128 expiry)");
    bytes32 private constant _TOPUP_ACTION =
        keccak256("TopUpAction(address caller,TopUp data)TopUp(address beneficiary,address membership,uint256 memberId,address voucher,uint256 value,address paymentToken,uint256 totalPayment,uint128 nonce,uint128 expiry)");

    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {}

    function _hashBuy(IPeriphery.Buy calldata _invoice) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _BUY, _invoice.beneficiary, _invoice.membership, _invoice.memberId, _invoice.paymentToken, _invoice.point, _invoice.totalPayment, _invoice.nonce, _invoice.expiry
            )
        );
    }

    function _getSignerBuyInvoice(
        address _caller,
        IPeriphery.Buy calldata _invoice,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _BUY_ACTION, _caller, _hashBuy(_invoice)
                )
            )
        ).recover(_signature);
    }

    function _hashRedeem(IPeriphery.Redeem calldata _invoice) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _REDEEM, _invoice.membership, _invoice.memberId, _invoice.point, _invoice.voucher, _invoice.value, _invoice.nonce, _invoice.expiry
            )
        );
    }

    function _getSignerRedeemInvoice(
        address _caller,
        IPeriphery.Redeem calldata _invoice,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _REDEEM_ACTION, _caller, _hashRedeem(_invoice)
                )
            )
        ).recover(_signature);
    }

    function _hashTopUp(IPeriphery.TopUp calldata _invoice) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                _TOPUP, _invoice.beneficiary, _invoice.membership, _invoice.memberId, _invoice.voucher, _invoice.value, _invoice.paymentToken, _invoice.totalPayment, _invoice.nonce, _invoice.expiry
            )
        );
    }

    function _getSignerTopUpInvoice(
        address _caller,
        IPeriphery.TopUp calldata _invoice,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _TOPUP_ACTION, _caller, _hashTopUp(_invoice)
                )
            )
        ).recover(_signature);
    }
}
