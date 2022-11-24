// SPDX-License-Identifier: None

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
   	@title Loyalty contract (ERC-20)
   	@dev This contract issues Loyalty Points that corresponding to one Membership type

	Note: 
    - Membership and Loyalty contract are deployed as a pair
    - Loyalty points are un-transferable/un-tradeable
    - But they could be swappable/exchangeable with constraints (optional)
*/
contract Loyalty is ERC20, Pausable, Ownable {

    uint8 private immutable DECIMALS;

    //  A list of Operators that are granted a privilege to operator special tasks
    mapping(address => bool) public operators;

    event UpdatePoint(
        address indexed member,
        uint256 indexed oPoint,
        uint256 indexed nPoint
    );

    modifier onlyOperator() {
        require(operators[_msgSender()], "Only Operator");
        _;
    }

    modifier disabled() {
        _;
        revert("Loyalty: transfer/approve are disabled");
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 _decimals
    ) ERC20(name_, symbol_) {
        DECIMALS = _decimals;
    }

    /**
       	@notice Return `decimals` of this Loyalty type
       	@dev  Caller can be ANY
    */
    function decimals() public view override returns (uint8) {
        return DECIMALS;
    }

    /**
       	@notice Set the contract to `paused = true` state
       	@dev  Caller must be Owner

        Note: During `paused = true`, loyalty points are unable to be updated
    */
    function pause() external onlyOwner {
        _pause();
    }

    /**
       	@notice Set the contract to `paused = false` state
       	@dev  Caller must be Owner

        Note: During `paused = false`, operations are back to normal
    */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
       	@notice Set/Unset `operator` of the Loyalty contract
       	@dev  Caller must be Owner
        @param _operators       A list of addresses will be set/unset a operator role
        @param _isAdded         Boolean flag (Set = True, Unset = False)

        Note: `operator` is a special role that has authority to update loyalty points
    */
    function setOperator(address[] calldata _operators, bool _isAdded) external onlyOwner {
        uint256 _len = _operators.length;

        for (uint256 i; i < _len; i++)
            operators[_operators[i]] = _isAdded;
    }

    /**
       	@notice Update loyalty points of `_account`
       	@dev  Caller must be Operator
        @param _account         Account address will be updated loyalty points
        @param _amount          Amount of points will be updated
        @param _isAdded         Boolean flag (Add = True, Deduct = False)
    */
    function updatePoint(address _account, uint256 _amount, bool _isAdded) external onlyOperator {
        uint256 _oPoint = balanceOf(_account);
        if (_isAdded) _mint(_account, _amount);
        else _burn(_account, _amount);
        uint256 _nPoint = balanceOf(_account);

        emit UpdatePoint(_account, _oPoint, _nPoint);
    }

    /**
       	@notice Disable `transfer()`
        Note: Loyalty points are un-transferable/un-tradeable
    */
    function transfer(address _to, uint256 _amount) public override disabled returns (bool) {}

    /**
       	@notice Disable `transferFrom()`
        Note: Loyalty points are un-transferable/un-tradeable
    */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public override disabled returns (bool) {}

    /**
       	@notice Disable `approve()`
        Note: Loyalty points are un-transferable/un-tradeable, thus approval setting is unnecessary
    */
    function approve(address _spender, uint256 _amount) public override disabled returns (bool) {}

    /**
       	@notice Disable `increaseAllowance()`
        Note: Loyalty points are un-transferable/un-tradeable, thus allowance setting is unnecessary
    */
    function increaseAllowance(address _spender, uint256 _addedValue) public override disabled returns (bool) {}

    /**
       	@notice Disable `decreaseAllowance()`
        Note: Loyalty points are un-transferable/un-tradeable, thus allowance setting is unnecessary
    */
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public override disabled returns (bool) {}

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(_from, _to, _amount);
    }
}
