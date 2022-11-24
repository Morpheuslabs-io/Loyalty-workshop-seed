// SPDX-License-Identifier: None

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
   	@title Membership contract (ERC-721)
   	@dev This contract issues Membership as NFT that corresponding to one Loyalty type

	Note: 
    - Membership and Loyalty contract are deployed as a pair
    - Membership is un-transferable/un-tradeable
*/
contract Membership is ERC721Enumerable, Pausable, Ownable {

    //  Define max tier of this Membership type
    uint256 private _maxTier;

    //  Requiring points per tier (tier_no => points)
    mapping(uint256 => uint256) private _requirements;

    //  Mapping current Tier to an account (address => memberId => tier_no)
    mapping(address => mapping(uint256 => uint256)) private _tier;

    //  A list of Operators that are granted a privilege to operator special tasks
    mapping(address => bool) public operators;

    //  TokenURI = baseURI + tokenId.toString()
    string public baseURI;

    modifier onlyOperator() {
        require(operators[_msgSender()], "Only Operator");
        _;
    }

    modifier disabled() {
        _;
        revert("Membership: transfer/approve are disabled");
    }

    event Cancel(uint256 indexed memberId);
    event Registration(address indexed member,uint256 indexed memberId);
    event Upgraded(
        address indexed member,
        uint256 indexed memberId,
        uint256 oTier,
        uint256 nTier
    );

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) {
        baseURI = baseURI_;
    }

    /**
       	@notice Get current `maxTier` of this membership type
       	@dev  Caller can be ANY
    */
    function maxTier() public view returns (uint256) {
        return _maxTier;
    }

    /**
       	@notice Get requiring loyalty points per tier
       	@dev  Caller can be ANY
        @param _tierNo       Tier number
    */
    function requirement(uint256 _tierNo) public view returns (uint256) {
        return _requirements[_tierNo];
    }

    /**
       	@notice Get current tier of `_account` with `_memberId`
       	@dev  Caller can be ANY
        @param _account         Account address to query a current tier
        @param _memberId        Member id of `_account`
    */
    function tier(address _account, uint256 _memberId) public view returns (uint256) {
        return _tier[_account][_memberId];
    }

    /**
       	@notice Find next tier of `_account` with `_memberId`
       	@dev  Caller can be ANY
        @param _account         Account address to check
        @param _memberId        Member id of `_account`
        @param _balance         Current loyalty point of `_account`

        Note: This function is used by Periphery contract to find next tier
        when `msg.sender` requests to upgrade his/her tier
    */
    function nextTier(address _account, uint256 _memberId, uint256 _balance) external view returns (uint256) {
        uint256 maxTier_ = maxTier();
        uint256 _nextRequirement = requirement(maxTier_);
        uint256 _mid;
        if (_balance >= _nextRequirement) return maxTier_;

        uint256 _lo = tier(_account, _memberId);
        uint256 _hi = maxTier_;
        while (_lo <= _hi) {
            _mid = (_lo + _hi) / 2;
            _nextRequirement = requirement(_mid);
            if (_balance < _nextRequirement) {
                _hi = _mid - 1;
            } else if (_balance > _nextRequirement) {
                _lo = _mid + 1;
            } else {
                return _mid;
            }
        }
        return _hi;
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
       	@notice Update new `baseURI`
       	@dev  Caller must be Owner
        @param _uri         A new string of `baseURI`     
    */
    function updateBaseURI(string calldata _uri) external onlyOwner {
        baseURI = _uri;
    }

    /**
       	@notice Set/Unset `operator` of the Loyalty contract
       	@dev  Caller must be Owner
        @param _operators       A list of addresses will be set/unset a operator role
        @param _isAdded         Boolean flag (Set = True, Unset = False)

        Note: `operator` is a special role that has authority to
        - Add new membership
        - Cancel a membership
        - Upgrade one member to next tier
    */
    function setOperator(address[] calldata _operators, bool _isAdded) external onlyOwner {
        uint256 _len = _operators.length;

        for (uint256 i; i < _len; i++)
            operators[_operators[i]] = _isAdded;
    }

    /**
       	@notice Set requiring points per tier
       	@dev  Caller must be Owner
        @param _values          A list of requiring points per tier (increasing order)
    */
    function config(uint256[] calldata _values) external onlyOwner {
        uint256 _currentMaxTier = _maxTier;
        uint256 __maxTier = _values.length;
        uint256 _max;
        uint256 _value;
        for (uint256 i; i < __maxTier; i++) {
            _value = _values[i];
            require(_value > _max, "Not ascending order");
            _max = _value;
            _requirements[i + 1] = _values[i];
        }
        _maxTier = __maxTier;

        //  @dev: Be careful when updating `_maxTier` is less than `currentMaxTier`
        //  since there might be some Users have been assigned these _tier
        if (__maxTier < _currentMaxTier) {
            _value = _currentMaxTier - __maxTier;
            for (uint256 i; i < _value; i++)
                delete _requirements[__maxTier + i + 1];
        }
    }

    /**
       	@notice Add new membership
       	@dev  Caller must be Operator
        @param _account          Account address to be added
        @param _memberId         Assigning member id
    */
    function addMembership(address _account, uint256 _memberId) external onlyOperator {
        _safeMint(_account, _memberId);

        emit Registration(_account, _memberId);
    }

    /**
       	@notice Cancel current membership
       	@dev  Caller must be Operator
        @param _memberId         Assigning member id
    */
    function cancelMembership(uint256 _memberId) external onlyOperator {
        _burn(_memberId);

        emit Cancel(_memberId);
    }

    /**
       	@notice Upgrade `_account` to next tier
       	@dev  Caller must be Operator
        @param _account          Account address to be added
        @param _memberId         Current member id
        @param _nextTier         Upcoming tier will be upgraded

        Note: Checking requiring points, as qualification, could either be done off-chain or on-chain 
    */
    function upgrade(address _account, uint256 _memberId, uint256 _nextTier) external onlyOperator {
        emit Upgraded(_account, _memberId, _tier[_account][_memberId], _nextTier);

        _tier[_account][_memberId] = _nextTier;
    }

    /**
       	@notice Query a list of Membership that owned by `_account`
       	@dev  Caller can be ANY
		@param	_account			Account's address to query
		@param	_fromIdx		    Starting index
		@param	_toIdx			    Ending index

        Note: It should be better when `_account` own one Membership only
    */
	function tokensByOwner(address _account, uint256 _fromIdx, uint256 _toIdx) external view returns (uint256[] memory _tokens) {
		uint256 _size = _toIdx - _fromIdx + 1;
		_tokens = new uint256[](_size);

		for(uint256 i; i < _size; i++) 
			_tokens[i] = tokenOfOwnerByIndex(_account, _fromIdx + i);
	}

    /**
       	@notice Disable `safeTransferFrom()`
        Note: Membership is un-transferable/un-tradeable
    */
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _memberId,
        bytes memory _data
    ) public override disabled {}

    /**
       	@notice Disable `safeTransferFrom()`
        Note: Membership is un-transferable/un-tradeable
    */
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _memberId
    ) public override disabled {}

    /**
       	@notice Disable `transferFrom()`
        Note: Membership is un-transferable/un-tradeable
    */
    function transferFrom(
        address _from,
        address _to,
        uint256 _memberId
    ) public override disabled {}

    /**
       	@notice Disable `approve()`
        Note: Membership is un-transferable/un-tradeable, thus approval setting is unnecessary
    */
    function approve(address to, uint256 tokenId) public override disabled {}

    /**
       	@notice Disable `setApprovalForAll()`
        Note: Membership is un-transferable/un-tradeable, thus approval setting is unnecessary
    */
    function setApprovalForAll(address operator, bool approved) public override disabled {}

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _firstTokenId, /* firstTokenId */
        uint256 _batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(_from, _to, _firstTokenId, _batchSize);
    }
}
