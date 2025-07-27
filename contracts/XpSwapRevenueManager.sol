// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title XpSwapRevenueManager
 * @dev XPSwap 플랫폼 수익 관리 컨트랙트
 */
contract XpSwapRevenueManager is ReentrancyGuard, Ownable, Pausable {
    
    struct RevenueStream {
        string name;
        address token;
        uint256 totalRevenue;
        uint256 distributedRevenue;
        uint256 lastDistributionTime;
        bool active;
    }
    
    struct StakeHolder {
        uint256 sharePercentage; // basis points (10000 = 100%)
        address payoutAddress;
        uint256 totalPaidOut;
        bool active;
    }
    
    mapping(uint256 => RevenueStream) public revenueStreams;
    mapping(address => StakeHolder) public stakeHolders;
    mapping(uint256 => mapping(address => uint256)) public claimableAmount;
    
    address[] public stakeHolderList;
    uint256 public streamCount;
    uint256 public totalSharePercentage;
    
    // Fee settings
    uint256 public platformFeeRate = 300; // 3% in basis points
    uint256 public burnRate = 100; // 1% burn rate
    address public feeRecipient;
    address public burnAddress = 0x000000000000000000000000000000000000dEaD;
    
    // Revenue tracking
    mapping(address => uint256) public tokenRevenue;
    mapping(address => uint256) public totalDistributed;
    
    event RevenueStreamAdded(uint256 indexed streamId, string name, address token);
    event RevenueReceived(uint256 indexed streamId, uint256 amount);
    event RevenueDistributed(uint256 indexed streamId, uint256 amount);
    event StakeHolderAdded(address indexed stakeHolder, uint256 sharePercentage);
    event StakeHolderUpdated(address indexed stakeHolder, uint256 newSharePercentage);
    event PayoutClaimed(address indexed stakeHolder, address token, uint256 amount);
    event FeesDistributed(address token, uint256 platformFee, uint256 burnAmount);
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev 새 수익 스트림 추가
     */
    function addRevenueStream(
        string memory _name,
        address _token
    ) external onlyOwner returns (uint256) {
        require(_token != address(0), "Invalid token address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        uint256 streamId = streamCount++;
        
        revenueStreams[streamId] = RevenueStream({
            name: _name,
            token: _token,
            totalRevenue: 0,
            distributedRevenue: 0,
            lastDistributionTime: block.timestamp,
            active: true
        });
        
        emit RevenueStreamAdded(streamId, _name, _token);
        return streamId;
    }
    
    /**
     * @dev 스테이크홀더 추가
     */
    function addStakeHolder(
        address _stakeHolder,
        uint256 _sharePercentage,
        address _payoutAddress
    ) external onlyOwner {
        require(_stakeHolder != address(0), "Invalid stakeholder address");
        require(_payoutAddress != address(0), "Invalid payout address");
        require(_sharePercentage > 0, "Share percentage must be greater than 0");
        require(totalSharePercentage + _sharePercentage <= 10000, "Total share exceeds 100%");
        require(!stakeHolders[_stakeHolder].active, "Stakeholder already exists");
        
        stakeHolders[_stakeHolder] = StakeHolder({
            sharePercentage: _sharePercentage,
            payoutAddress: _payoutAddress,
            totalPaidOut: 0,
            active: true
        });
        
        stakeHolderList.push(_stakeHolder);
        totalSharePercentage += _sharePercentage;
        
        emit StakeHolderAdded(_stakeHolder, _sharePercentage);
    }
    
    /**
     * @dev 스테이크홀더 지분 업데이트
     */
    function updateStakeHolder(
        address _stakeHolder,
        uint256 _newSharePercentage,
        address _newPayoutAddress
    ) external onlyOwner {
        require(stakeHolders[_stakeHolder].active, "Stakeholder does not exist");
        require(_newPayoutAddress != address(0), "Invalid payout address");
        
        uint256 oldShare = stakeHolders[_stakeHolder].sharePercentage;
        require(totalSharePercentage - oldShare + _newSharePercentage <= 10000, "Total share exceeds 100%");
        
        totalSharePercentage = totalSharePercentage - oldShare + _newSharePercentage;
        
        stakeHolders[_stakeHolder].sharePercentage = _newSharePercentage;
        stakeHolders[_stakeHolder].payoutAddress = _newPayoutAddress;
        
        emit StakeHolderUpdated(_stakeHolder, _newSharePercentage);
    }
    
    /**
     * @dev 수익 기록
     */
    function recordRevenue(uint256 _streamId, uint256 _amount) external {
        require(_streamId < streamCount, "Invalid stream ID");
        require(_amount > 0, "Amount must be greater than 0");
        
        RevenueStream storage stream = revenueStreams[_streamId];
        require(stream.active, "Stream is not active");
        
        // Transfer tokens to contract
        IERC20(stream.token).transferFrom(msg.sender, address(this), _amount);
        
        // Update revenue tracking
        stream.totalRevenue += _amount;
        tokenRevenue[stream.token] += _amount;
        
        emit RevenueReceived(_streamId, _amount);
        
        // Auto-distribute if conditions are met
        _autoDistribute(_streamId);
    }
    
    /**
     * @dev 수익 분배
     */
    function distributeRevenue(uint256 _streamId) external nonReentrant {
        require(_streamId < streamCount, "Invalid stream ID");
        
        RevenueStream storage stream = revenueStreams[_streamId];
        require(stream.active, "Stream is not active");
        
        uint256 availableRevenue = stream.totalRevenue - stream.distributedRevenue;
        require(availableRevenue > 0, "No revenue to distribute");
        
        _distributeRevenue(_streamId, availableRevenue);
    }
    
    /**
     * @dev 내부 수익 분배 함수
     */
    function _distributeRevenue(uint256 _streamId, uint256 _amount) internal {
        RevenueStream storage stream = revenueStreams[_streamId];
        
        // Calculate fees
        uint256 platformFee = (_amount * platformFeeRate) / 10000;
        uint256 burnAmount = (_amount * burnRate) / 10000;
        uint256 distributableAmount = _amount - platformFee - burnAmount;
        
        // Distribute to stakeholders
        for (uint256 i = 0; i < stakeHolderList.length; i++) {
            address stakeholder = stakeHolderList[i];
            if (stakeHolders[stakeholder].active) {
                uint256 share = (distributableAmount * stakeHolders[stakeholder].sharePercentage) / 10000;
                claimableAmount[_streamId][stakeholder] += share;
            }
        }
        
        // Handle fees
        if (platformFee > 0) {
            IERC20(stream.token).transfer(feeRecipient, platformFee);
        }
        
        if (burnAmount > 0) {
            IERC20(stream.token).transfer(burnAddress, burnAmount);
        }
        
        // Update tracking
        stream.distributedRevenue += _amount;
        stream.lastDistributionTime = block.timestamp;
        totalDistributed[stream.token] += distributableAmount;
        
        emit RevenueDistributed(_streamId, _amount);
        emit FeesDistributed(stream.token, platformFee, burnAmount);
    }
    
    /**
     * @dev 자동 분배 (조건 충족 시)
     */
    function _autoDistribute(uint256 _streamId) internal {
        RevenueStream storage stream = revenueStreams[_streamId];
        uint256 availableRevenue = stream.totalRevenue - stream.distributedRevenue;
        
        // Auto-distribute if accumulated revenue exceeds threshold or time passed
        uint256 threshold = 1000 * 10**18; // 1000 tokens threshold
        uint256 timeThreshold = 7 days;
        
        if (availableRevenue >= threshold || 
            (availableRevenue > 0 && block.timestamp >= stream.lastDistributionTime + timeThreshold)) {
            _distributeRevenue(_streamId, availableRevenue);
        }
    }
    
    /**
     * @dev 수익 청구
     */
    function claimPayout(uint256 _streamId) external nonReentrant {
        require(_streamId < streamCount, "Invalid stream ID");
        require(stakeHolders[msg.sender].active, "Not a stakeholder");
        
        uint256 amount = claimableAmount[_streamId][msg.sender];
        require(amount > 0, "No claimable amount");
        
        RevenueStream storage stream = revenueStreams[_streamId];
        address payoutAddress = stakeHolders[msg.sender].payoutAddress;
        
        claimableAmount[_streamId][msg.sender] = 0;
        stakeHolders[msg.sender].totalPaidOut += amount;
        
        IERC20(stream.token).transfer(payoutAddress, amount);
        
        emit PayoutClaimed(msg.sender, stream.token, amount);
    }
    
    /**
     * @dev 모든 스트림에서 수익 청구
     */
    function claimAllPayouts() external nonReentrant {
        require(stakeHolders[msg.sender].active, "Not a stakeholder");
        
        address payoutAddress = stakeHolders[msg.sender].payoutAddress;
        uint256 totalClaimed = 0;
        
        for (uint256 i = 0; i < streamCount; i++) {
            uint256 amount = claimableAmount[i][msg.sender];
            if (amount > 0) {
                RevenueStream storage stream = revenueStreams[i];
                claimableAmount[i][msg.sender] = 0;
                totalClaimed += amount;
                
                IERC20(stream.token).transfer(payoutAddress, amount);
                emit PayoutClaimed(msg.sender, stream.token, amount);
            }
        }
        
        require(totalClaimed > 0, "No claimable amount");
        stakeHolders[msg.sender].totalPaidOut += totalClaimed;
    }
    
    /**
     * @dev 청구 가능한 금액 확인
     */
    function getClaimableAmount(uint256 _streamId, address _stakeholder) external view returns (uint256) {
        return claimableAmount[_streamId][_stakeholder];
    }
    
    /**
     * @dev 모든 스트림의 청구 가능한 금액 확인
     */
    function getTotalClaimableAmount(address _stakeholder) external view returns (uint256 total) {
        for (uint256 i = 0; i < streamCount; i++) {
            total += claimableAmount[i][_stakeholder];
        }
    }
    
    /**
     * @dev 수익 스트림 정보 조회
     */
    function getRevenueStreamInfo(uint256 _streamId) external view returns (
        string memory name,
        address token,
        uint256 totalRevenue,
        uint256 distributedRevenue,
        uint256 availableRevenue,
        uint256 lastDistributionTime,
        bool active
    ) {
        require(_streamId < streamCount, "Invalid stream ID");
        
        RevenueStream storage stream = revenueStreams[_streamId];
        availableRevenue = stream.totalRevenue - stream.distributedRevenue;
        
        return (
            stream.name,
            stream.token,
            stream.totalRevenue,
            stream.distributedRevenue,
            availableRevenue,
            stream.lastDistributionTime,
            stream.active
        );
    }
    
    // Owner functions
    function setPlatformFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newRate;
    }
    
    function setBurnRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 500, "Burn rate cannot exceed 5%");
        burnRate = _newRate;
    }
    
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        feeRecipient = _newRecipient;
    }
    
    function setStreamActive(uint256 _streamId, bool _active) external onlyOwner {
        require(_streamId < streamCount, "Invalid stream ID");
        revenueStreams[_streamId].active = _active;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
