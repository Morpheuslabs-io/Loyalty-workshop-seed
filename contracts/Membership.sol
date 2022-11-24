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
    uint256 public maxTier;

    //  Requiring points per tier (tier_no => points)
    mapping(uint256 => uint256) public requirements;

    //  Mapping current Tier to an account (address => memberId => tier_no)
    mapping(address => mapping(uint256 => uint256)) public tiers;

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
        uint256 _currentMaxTier = maxTier;
        uint256 _maxTier = _values.length;
        uint256 _max;
        uint256 _value;
        for (uint256 i; i < _maxTier; i++) {
            _value = _values[i];
            require(_value > _max, "Not ascending order");
            _max = _value;
            requirements[i + 1] = _values[i];
        }
        maxTier = _maxTier;

        //  @dev: Be careful when updating `maxTier` is less than `currentMaxTier`
        //  since there might be some Users have been assigned these tiers
        if (_maxTier < _currentMaxTier) {
            _value = _currentMaxTier - _maxTier;
            for (uint256 i; i < _value; i++)
                delete requirements[_maxTier + i + 1];
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
        emit Upgraded(_account, _memberId, tiers[_account][_memberId], _nextTier);

        tiers[_account][_memberId] = _nextTier;
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
