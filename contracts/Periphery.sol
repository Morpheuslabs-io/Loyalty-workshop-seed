// SPDX-License-Identifier: None

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IMembership.sol";
import "./interfaces/ILoyalty.sol";
import "./interfaces/IVoucher.sol";
import "./utils/Signer.sol";

/**
   	@title Periphery contract
   	@dev This contract provide additional features and external interfaces on top of Membership, Loyalty and Voucher contracts 
    - Add a method to buy loyalty points using crypto currency
    - Add a method to redeem loyalty points (loyalty points -> voucher's value)
    - Add a method to purchase/topup a voucher/gift card

    Note: Contract using EIP-712 for a signing scheme
*/
contract Periphery is IPeriphery, Signer, Ownable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    //  Address to receive payments
    address public treasury;

    //  Mapping address of Membership contract to a group/pair id
    mapping(address => address) private membershipToLoyalty;

    //  Mapping Membership to supporting vouchers
    mapping(address => EnumerableSet.AddressSet) private vouchers;

    //  A list of Memberships has been disabled
    mapping(address => bool) public disabled;

    //  A list of Verifiers who sign a request to authorize
    mapping(address => bool) public verifiers;

    //  Counting a number of requests (from each of accounts) that has been proceeded
    mapping(address => uint256) public nonces;

    event Disabled(address indexed membership, address indexed loyalty);
    event Enabled(address indexed membership, address indexed loyalty);
    event Updated(address indexed membership, address indexed voucher, bool isAdded);

    modifier checkStatus(address _membership) {
        require(
            !disabled[_membership] && getLoyalty(_membership) != address(0), "Unable to disable"
        );
        _;
    }

    constructor(address _treasury, address _verifier) Signer("Membership and Loyalty", "Version 1") Ownable() {
        treasury = _treasury;
        verifiers[_verifier] = true;
    }

    /**
       	@notice Return corresponding `_loyalty` contract to `_membership` contract
       	@dev  Caller can be ANY
    */
    function getLoyalty(address _membership) public view returns (address) {
        return membershipToLoyalty[_membership];
    }

    /**
       	@notice Set/Unset `verifier` of the Periphery contract
       	@dev  Caller must be Owner
        @param _verifiers       A list of addresses will be set/unset a verifier role
        @param _isAdded         Boolean flag (Set = True, Unset = False)

        Note: `verifier` is a special role that has authority to provide a request's authorizing signature
    */
    function setVerifiers(address[] calldata _verifiers, bool _isAdded) external onlyOwner {
        uint256 _len = _verifiers.length;

        for (uint256 i; i < _len; i++)
            verifiers[_verifiers[i]] = _isAdded;
    }

    /**
       	@notice Register a pair of `_membership` and `_loyalty` contracts
       	@dev  Caller must be Owner
        @param _membership          Address of `_membership` contract
        @param _loyalty             Address of `_loyalty` contract
        @param _voucher             Address of `_voucher` contract (optional)

        Note: 
        - `_voucher` will be optional. Should leave it 0x00 when it's not set
        - For each pair of Membership and Loyalty, it comes along with a list of `_voucher` contracts
        that are allowed to redeem
    */
    function addPair(address _membership, address _loyalty, address _voucher) external onlyOwner {
        require(_membership != address(0) && _loyalty != address(0), "Zero Address");
        require(getLoyalty(_membership) == address(0), "Membership already paired");

        membershipToLoyalty[_membership] = _loyalty;
        if (_voucher != address(0)) {
            vouchers[_membership].add(_voucher);
            emit Updated(_membership, _voucher, true);
        }
        emit Enabled(_membership, _loyalty);
    }

    /**
       	@notice Disable a pair of `_membership` and `_loyalty` contracts
       	@dev  Caller must be Owner
        @param _membership          Address of `_membership` contract

        Note: 
        - When a pair is disabled, operations relate to `_membership`, `_loyalty` will also be disabled
        - A list of supporting `_voucher` for this pair is set by using EnumerableSet.AddressSet,
        it pretty costs to delete/remove them when a `_membership` contract is disabled. Thus, just mark
        this pair as `disabled`
        - When re-enabling a pair, make sure checking and updating a list of supporting `_voucher`
    */
    function disablePair(address _membership) external onlyOwner checkStatus(_membership) {
        disabled[_membership] = true;

        emit Disabled(_membership, getLoyalty(_membership));
    }

    /**
       	@notice Re-enable a pair of `_membership` and `_loyalty` contracts
       	@dev  Caller must be Owner
        @param _membership          Address of `_membership` contract

        Note: 
        - After disabling a pair, a list of supporting `_voucher` is not deleted
        Thus, make sure checking and updating this list when re-enabling, 
    */
    function enablePair(address _membership) external onlyOwner {
        require(disabled[_membership], "Unable to enable");

        delete disabled[_membership];
        emit Enabled(_membership, getLoyalty(_membership));
    }

    /**
       	@notice Add/Remove support `_voucher` contract for a `_membership`
       	@dev  Caller must be Owner
        @param _membership          Address of `_membership` contract
        @param _vouchers            A list of `_voucher` contracts
        @param _isAdded             Boolean flag (Add = True, Remove = False)

        Note: `_membership` is disabled, `_voucher` list cannot be updated
    */
    function updateVouchers(address _membership, address[] calldata _vouchers, bool _isAdded) external onlyOwner checkStatus(_membership) {
        uint256 _len = _vouchers.length;
        address _voucher;
        for (uint256 i; i < _len; i++) {
            _voucher = _vouchers[i];
            if (_isAdded)
                vouchers[_membership].add(_voucher);   
            else 
                vouchers[_membership].remove(_voucher);

            emit Updated(_membership, _voucher, _isAdded);
        }   
    }

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
    function redeem(Redeem calldata _invoice, bytes calldata _signature) external override {
        address _caller = msg.sender;
        _precheck(_caller, _invoice.expiry, _invoice.nonce);
        address _loyalty = _checkMembership(_caller, _invoice.membership, _invoice.memberId);
        _checkRedeemInvoiceSig(_caller, _invoice, _signature);
        _updatePoint(_loyalty, _caller, _invoice.point, false);
        _validateVoucher(_invoice.membership, _invoice.voucher);
        _topup(_caller, _caller, _invoice.voucher, _invoice.value);
    }

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
    function topup(TopUp calldata _invoice, bytes calldata _signature) external payable {
        address _caller = msg.sender;
        _precheck(_caller, _invoice.expiry, _invoice.nonce);
        _checkMembership(_invoice.beneficiary, _invoice.membership, _invoice.memberId);
        _checkTopUpInvoiceSig(_caller, _invoice, _signature);
        if (_invoice.paymentToken == address(0))
            require(msg.value == _invoice.totalPayment, "Invalid payment");

        _makePayment(_invoice.paymentToken, _caller, _invoice.totalPayment);
        _validateVoucher(_invoice.membership, _invoice.voucher);
        _topup(_caller, _invoice.beneficiary, _invoice.voucher, _invoice.value);
    }

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
    ) external payable override {
        address _caller = msg.sender;
        _precheck(_caller, _invoice.expiry, _invoice.nonce);
        address _loyalty = _checkMembership(_invoice.beneficiary, _invoice.membership, _invoice.memberId);
        _checkBuyInvoiceSig(_caller, _invoice, _signature);
        if (_invoice.paymentToken == address(0))
            require(msg.value == _invoice.totalPayment, "Invalid payment");

        _makePayment(_invoice.paymentToken, _caller, _invoice.totalPayment);
        nonces[_caller]++;
        _updatePoint(_loyalty, _invoice.beneficiary, _invoice.point, true);
    }

    function _precheck(
        address _caller,
        uint256 _expiry,
        uint256 _nonce
    ) private view {
        require(block.timestamp <= _expiry, "Signature is expired");
        require(_nonce == nonces[_caller], "Invalid nonce");
    }

    function _checkMembership(
        address _beneficiary,
        address _membership,
        uint256 _memberId
    ) private view returns (address _loyalty) {
        _loyalty = getLoyalty(_membership);
        require(
            _loyalty != address(0) && !disabled[_membership], "Unsupport this membership type"
        );
        require(
            IMembership(_membership).ownerOf(_memberId) == _beneficiary,
            "Beneficiary and memberId not match"
        );
    }

    function _validateVoucher(address _membership, address _voucher) private view {
        require(vouchers[_membership].contains(_voucher), "Unsupport this voucher type");
    }

    function _checkRedeemInvoiceSig(
        address _caller,
        Redeem calldata _invoice,
        bytes calldata _signature
    ) private view {
        _isAuthorizer(Signer._getSignerRedeemInvoice(_caller, _invoice, _signature));
    }

    function _checkBuyInvoiceSig(
        address _caller,
        Buy calldata _invoice,
        bytes calldata _signature
    ) private view {
        _isAuthorizer(Signer._getSignerBuyInvoice(_caller, _invoice, _signature));
    }

    function _checkTopUpInvoiceSig(
        address _caller,
        TopUp calldata _invoice,
        bytes calldata _signature
    ) private view {
        _isAuthorizer(Signer._getSignerTopUpInvoice(_caller, _invoice, _signature));
    }

    function _isAuthorizer(address _signer) private view {
        require(verifiers[_signer], "Unauthorized signature");
    }

    function _updatePoint(address _loyalty, address _account, uint256 _point, bool _opt) private {
        ILoyalty(_loyalty).updatePoint(_account, _point, _opt);
    }

    function _topup(
        address _caller,
        address _beneficiary,
        address _voucher,
        uint256 _value
    ) private {
        nonces[_caller]++;
        IVoucher(_voucher).updateValue(_beneficiary, _value, true);
    }

    function _makePayment(address _token, address _from, uint256 _amount) private {
        address _treasury = treasury;
        if (_token == address(0))
            Address.sendValue(payable(_treasury), _amount);
        else IERC20(_token).safeTransferFrom(_from, _treasury, _amount);
    }
}
