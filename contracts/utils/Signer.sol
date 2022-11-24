// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IPeriphery.sol";

contract Signer is EIP712 {
    using ECDSA for bytes32;

    bytes32 private constant _BUY =
        keccak256("BuyAction(address caller,Buy data)");
    bytes32 private constant _REDEEM =
        keccak256("RedeemAction(address caller,Redeem data)");
    bytes32 private constant _TOPUP =
        keccak256("TopUpAction(address caller,TopUp data)");

    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {}

    function _getSignerRedeemInvoice(
        address _caller,
        IPeriphery.Redeem calldata _redeem,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(_REDEEM, _caller,_redeem)
            )
        ).recover(_signature);
    }

    function _getSignerBuyInvoice(
        address _caller,
        IPeriphery.Buy calldata _invoice,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(_BUY, _caller, _invoice)
            )
        ).recover(_signature);
    }

    function _getSignerTopUpInvoice(
        address _caller,
        IPeriphery.TopUp calldata _invoice,
        bytes calldata _signature
    ) internal view returns (address _signer) {
        _signer = _hashTypedDataV4(
            keccak256(
                abi.encode(_TOPUP, _caller, _invoice)
            )
        ).recover(_signature);
    }
}
