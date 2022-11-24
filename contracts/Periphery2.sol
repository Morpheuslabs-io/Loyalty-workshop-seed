// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMembership.sol";
import "./interfaces/IPeriphery.sol";
import "./interfaces/ILoyalty.sol";

/**
   	@title Periphery2 contract (Optional)
   	@dev This contract provide additional feature and external interface (beside Periphery) on top of Membership, Loyalty and Voucher contracts
    - Register/Unregister exchange pair of Loyalty types
    - Add a method of swapping two Loyalty types (Regular)
    - Add a method of swapping two Loyalty types (Special Event)

    Note: This contract is optional to provide a swappable feature among Loyalty types
*/
contract Periphery2 is Ownable {

    struct XRate {
        uint256 bValue;             //  base value
        uint256 qValue;             //  quote value
    }

    struct Schedule {
        uint256 start;
        uint256 end;
    }

    //  Address of Periphery contract
    IPeriphery public periphery;

    //  Regular exchange rate for a pair of two Loyalty types 
    //  (address (base) => address (quote) => exchange_rate)
    mapping(address => mapping(address => XRate)) private _globalRates;

    //  Exclusive exchange rate for a pair of two Loyalty types during one special event
    //  (event_id => address (base) => address (quote) => exchange_rate)
    mapping(uint256 => mapping(address => mapping(address => XRate))) private _specialRates;

    //  Event schedule (event_id => starting and ending time)
    mapping(uint256 => Schedule) private _schedules;

    event Swap(
        uint256 eventId,
        address indexed caller,
        address indexed bMembership,
        address indexed qMembership,
        uint256 bAmount,
        uint256 qAmount
    );

    constructor(IPeriphery _periphery) Ownable() {
        periphery = _periphery;
    }

    /**
       	@notice Return global exchange rate of two loyalty types
       	@dev  Caller can be ANY
        @param _bMembership             Address of base Membership contract
        @param _qMembership             Address of quote Membership contract
    */
    function globalRate(address _bMembership, address _qMembership) public view returns (XRate memory) {
        return _globalRates[_bMembership][_qMembership];
    }

    /**
       	@notice Return special exchange rate of two loyalty types during `_eventId`
       	@dev  Caller can be ANY
        @param _eventId                 Event id
        @param _bMembership             Address of base Membership contract
        @param _qMembership             Address of quote Membership contract
    */
    function specialRate(uint256 _eventId, address _bMembership, address _qMembership) public view returns (XRate memory) {
        require(schedule(_eventId).start != 0, "EventId not exists");
        return _specialRates[_eventId][_bMembership][_qMembership];
    }

    /**
       	@notice Return schedule of `_eventId`
       	@dev  Caller can be ANY
        @param _eventId                 Event id
    */
    function schedule(uint256 _eventId) public view returns (Schedule memory) {
        return _schedules[_eventId];
    }

    /**
       	@notice Set schedule of `_eventId`
       	@dev  Caller must be Owner
        @param _eventId                 Event id
        @param _start                   Starting time (unix timestamp)
        @param _end                     Ending time (unix timestamp)
    */
    function setSchedule(uint256 _eventId, uint256 _start, uint256 _end) external onlyOwner {
        uint256 _currentTime = block.timestamp;
        require(schedule(_eventId).start == 0, "EventId exists");
        require(_start >= _currentTime && _start < _end, "Invalid schedule");

        _schedules[_eventId].start = _start;
        _schedules[_eventId].end = _end;
    }

    /**
       	@notice Adjust ending time of `_eventId`
       	@dev  Caller must be Owner
        @param _eventId                 Event id
        @param _end                     New ending time (unix timestamp)
    */
    function adjust(uint256 _eventId, uint256 _end) external onlyOwner {
        uint256 _currentTime = block.timestamp;
        Schedule memory schedule_ = _schedules[_eventId];
        require(schedule_.start != 0 && _currentTime < schedule_.end, "Invalid request");

        _schedules[_eventId].end = _end;
    }

    /**
       	@notice Set exchange rate of multiple pairs
       	@dev  Caller must be Owner
        @param _eventId                 Event id
        @param _baseMemberships         A list of base Membership contracts
        @param _quoteMemberships        A list of quote Membership contracts
        @param _baseValues              A list of input amounts
        @param _quoteValues             A list of output amounts

        Note:
        - Using this method to unregister exchanging pairs (by setting exchange_rate to 0)
        - Global and special settings must be separated
        - Event's schedule must be set before setting special exchange rates
        - Just passing one direction of conversion rate, other direction is reversed accordingly
        Example:
            + _bMemberships = [Type A, Type B]
            + _qMemberships = [Type C, Type D]
            + _baseValues = [1, 2]
            + _quoteValues = [5, 15]
    */
    function setXRate(
        uint256 _eventId,
        address[] calldata _baseMemberships,
        address[] calldata _quoteMemberships,
        uint256[] calldata _baseValues,
        uint256[] calldata _quoteValues
    ) external onlyOwner {
        uint256 _len = _baseMemberships.length;
        require(
            _baseValues.length == _len &&
            _quoteMemberships.length == _len &&
            _quoteValues.length == _len,
            "Invalid length"
        );

        _eventId != 0 ? _setGlobalRate(_len, _baseMemberships, _quoteMemberships, _baseValues, _quoteValues) : _setSpecialRate(_len, _eventId, _baseMemberships, _quoteMemberships, _baseValues, _quoteValues);
    }

    /**
       	@notice Swap of two types of loyalty points (Regular)
       	@dev  Caller can be ANY
        @param _bMembership             Address of base Membership contract
        @param _bMemberId               Base membership id of `msg.sender`
        @param _qMembership             Address of quote Membership contract
        @param _qMemberId               Quote membership id of `msg.sender`
        @param _bAmount                 Swapping amount of points
    */
    function regularSwap(address _bMembership, uint256 _bMemberId, address _qMembership, uint256 _qMemberId, uint256 _bAmount) external {
        _swap(0, _bMembership, _bMemberId, _qMembership, _qMemberId, _bAmount);
    }

    /**
       	@notice Swap two types of loyalty points during `_eventId`
       	@dev  Caller can be ANY
        @param _eventId                 Event id
        @param _bMembership             Address of base Membership contract
        @param _bMemberId               Base membership id of `msg.sender`
        @param _qMembership             Address of quote Membership contract
        @param _qMemberId               Quote membership id of `msg.sender`
        @param _bAmount                 Swapping amount of points
    */
    function specialSwap(uint256 _eventId, address _bMembership, uint256 _bMemberId, address _qMembership, uint256 _qMemberId, uint256 _bAmount) external {
        uint256 _currentTime = block.timestamp;
        Schedule memory schedule_ = schedule(_eventId);
        require(
            schedule_.start <= _currentTime && _currentTime <= schedule_.end,
            "Event not yet started or already ended"
        );
        _swap(_eventId, _bMembership, _bMemberId, _qMembership, _qMemberId, _bAmount);
    }

    function _swap(uint256 _eventId, address _bMembership, uint256 _bMemberId, address _qMembership, uint256 _qMemberId, uint256 _bAmount) private {
        address _caller = msg.sender;
        require(
            IMembership(_bMembership).ownerOf(_bMemberId) == _caller &&
            IMembership(_qMembership).ownerOf(_qMemberId) == _caller,
            "Memberships not recorded"
        );

        XRate memory _xrate;
        if (_eventId != 0)
            _xrate = specialRate(_eventId, _bMembership, _qMembership);
        else
            _xrate = globalRate(_bMembership, _qMembership); 
        require(
            _xrate.bValue != 0 && _xrate.qValue != 0, "Unsupport swapping the pair"
        );
        uint256 _qAmount = _bAmount * _xrate.qValue / _xrate.bValue;

        IPeriphery _periphery = periphery;
        ILoyalty(_periphery.getLoyalty(_bMembership)).updatePoint(_caller, _bAmount, false);
        ILoyalty(_periphery.getLoyalty(_qMembership)).updatePoint(_caller, _qAmount, true);

        emit Swap(_eventId, _caller, _bMembership, _qMembership, _bAmount, _qAmount);
    }

    function _setGlobalRate(
        uint256 _len,
        address[] calldata _baseMemberships,
        address[] calldata _quoteMemberships,
        uint256[] calldata _baseValues,
        uint256[] calldata _quoteValues
    ) private {
        address _bMembership;
        address _qMembership;
        for (uint256 i; i < 2 * _len; i++) {
            if (i < _len) {
                _bMembership = _baseMemberships[i];
                _qMembership = _quoteMemberships[i];
                _globalRates[_bMembership][_qMembership].bValue = _baseValues[i];
                _globalRates[_bMembership][_qMembership].qValue = _quoteValues[i];
            }
            else {
                _bMembership = _baseMemberships[i - _len];
                _qMembership = _quoteMemberships[i - _len];
                _globalRates[_qMembership][_bMembership].bValue = _quoteValues[i - _len];
                _globalRates[_qMembership][_bMembership].qValue = _baseValues[i - _len];
            }
        }
    }

    function _setSpecialRate(
        uint256 _len,
        uint256 _eventId,
        address[] calldata _baseMemberships,
        address[] calldata _quoteMemberships,
        uint256[] calldata _baseValues,
        uint256[] calldata _quoteValues
    ) private {
        {
            uint256 _currentTime = block.timestamp;
            Schedule memory schedule_ = _schedules[_eventId];
            require(
                schedule_.start != 0 && schedule_.start <= _currentTime && _currentTime <= schedule_.end,
                "Invalid request"
            );
        }

        address _bMembership;
        address _qMembership;
        for (uint256 i; i < 2 * _len; i++) {
            if (i < _len) {
                _bMembership = _baseMemberships[i];
                _qMembership = _quoteMemberships[i];
                _specialRates[_eventId][_bMembership][_qMembership].bValue = _baseValues[i];
                _specialRates[_eventId][_bMembership][_qMembership].qValue = _quoteValues[i];
            }
            else {
                _bMembership = _baseMemberships[i - _len];
                _qMembership = _quoteMemberships[i - _len];
                _specialRates[_eventId][_qMembership][_bMembership].bValue = _quoteValues[i - _len];
                _specialRates[_eventId][_qMembership][_bMembership].qValue = _baseValues[i - _len];
            }
        }
    }
}
