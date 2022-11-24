// SPDX-License-Identifier: None

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
   	@title Voucher contract (ERC-20)
   	@dev This contract issues Voucher/Gift Card's Points

	Note: 
    - Each of Voucher type needs to deploy a distinctive contract
    - Unlike membership and loyalty points, Voucher/Gift Card's value is tradeable, transferable, and also swappable as ERC-20 standard
*/
contract Voucher is ERC20, Pausable, Ownable {

    uint8 private immutable DECIMALS;

    //  A list of Operators that are granted a privilege to operator special tasks
    mapping(address => bool) public operators;

    event UpdateValue(
        address indexed member,
        uint256 indexed oValue,
        uint256 indexed nValue
    );

    modifier onlyOperator() {
        require(operators[_msgSender()], "Only Operator");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 _decimals
    ) ERC20(name_, symbol_) {
        DECIMALS = _decimals;
    }

    /**
       	@notice Return `decimals` of this Voucher type
       	@dev  Caller can be ANY
    */
    function decimals() public view override returns (uint8) {
        return DECIMALS;
    }

    /**
       	@notice Set the contract to `paused = true` state
       	@dev  Caller must be Owner

        Note: During `paused = true`, voucher's values are unable to be updated
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

        Note: `operator` is a special role that has authority to update voucher's values
    */
    function setOperator(address[] calldata _operators, bool _isAdded) external onlyOwner {
        uint256 _len = _operators.length;

        for (uint256 i; i < _len; i++)
            operators[_operators[i]] = _isAdded;
    }

    /**
       	@notice Update voucher's value of `_account`
       	@dev  Caller must be Operator
        @param _account         Account address will be updated voucher's value
        @param _amount          Amount of values will be updated
        @param _isAdded         Boolean flag (Add = True, Deduct = False)
    */
    function updateValue(address _account, uint256 _amount, bool _isAdded) external onlyOperator {
        uint256 _oValue = balanceOf(_account);
        if (_isAdded) _mint(_account, _amount);
        else _burn(_account, _amount);
        uint256 _nValue = balanceOf(_account);

        emit UpdateValue(_account, _oValue, _nValue);
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(_from, _to, _amount);
    }
}
