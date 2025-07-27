// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title XpSwapStaking
 * @dev XPS 토큰 스테이킹 컨트랙트
 */
contract XpSwapStaking is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable stakingToken;
    
    struct Stake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 stakingTime;
        uint256 lockPeriod; // 0 = flexible, 30/90/180/365 days
    }
    
    mapping(address => Stake) public stakes;
    mapping(uint256 => uint256) public lockPeriodRewards; // lock period => APR basis points
    
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% base APR (100 basis points)
    uint256 public constant REWARD_PRECISION = 10000;
    
    uint256 public accRewardPerShare;
    uint256 public lastRewardTime;
    uint256 public rewardPerSecond;
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    
    constructor(
        address _stakingToken,
        uint256 _rewardPerSecond
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardPerSecond = _rewardPerSecond;
        lastRewardTime = block.timestamp;
        
        // Lock period rewards (APR in basis points)
        lockPeriodRewards[0] = 100;    // 1% flexible
        lockPeriodRewards[30] = 300;   // 3% for 30 days
        lockPeriodRewards[90] = 800;   // 8% for 90 days
        lockPeriodRewards[180] = 1500; // 15% for 180 days
        lockPeriodRewards[365] = 2500; // 25% for 365 days
    }
    
    /**
     * @dev 토큰 스테이킹
     */
    function stake(uint256 _amount, uint256 _lockPeriod) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _lockPeriod == 0 || _lockPeriod == 30 || _lockPeriod == 90 || 
            _lockPeriod == 180 || _lockPeriod == 365,
            "Invalid lock period"
        );
        
        updateReward();
        
        // Transfer tokens
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        
        // Update user stake
        Stake storage userStake = stakes[msg.sender];
        
        if (userStake.amount > 0) {
            // Claim pending rewards
            uint256 pending = (userStake.amount * accRewardPerShare / 1e12) - userStake.rewardDebt;
            if (pending > 0) {
                stakingToken.transfer(msg.sender, pending);
                emit RewardClaimed(msg.sender, pending);
            }
        }
        
        userStake.amount += _amount;
        userStake.stakingTime = block.timestamp;
        userStake.lockPeriod = _lockPeriod;
        userStake.rewardDebt = userStake.amount * accRewardPerShare / 1e12;
        
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount, _lockPeriod);
    }
    
    /**
     * @dev 토큰 언스테이킹
     */
    function unstake(uint256 _amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= _amount, "Insufficient staked amount");
        
        // Check lock period
        if (userStake.lockPeriod > 0) {
            require(
                block.timestamp >= userStake.stakingTime + (userStake.lockPeriod * 1 days),
                "Tokens are still locked"
            );
        }
        
        updateReward();
        
        // Calculate pending rewards
        uint256 pending = (userStake.amount * accRewardPerShare / 1e12) - userStake.rewardDebt;
        
        // Update user stake
        userStake.amount -= _amount;
        userStake.rewardDebt = userStake.amount * accRewardPerShare / 1e12;
        totalStaked -= _amount;
        
        // Transfer tokens and rewards
        stakingToken.transfer(msg.sender, _amount);
        
        if (pending > 0) {
            stakingToken.transfer(msg.sender, pending);
            emit RewardClaimed(msg.sender, pending);
        }
        
        emit Unstaked(msg.sender, _amount);
    }
    
    /**
     * @dev 보상 청구
     */
    function claimReward() external nonReentrant {
        updateReward();
        
        Stake storage userStake = stakes[msg.sender];
        uint256 pending = (userStake.amount * accRewardPerShare / 1e12) - userStake.rewardDebt;
        
        require(pending > 0, "No reward to claim");
        
        userStake.rewardDebt = userStake.amount * accRewardPerShare / 1e12;
        stakingToken.transfer(msg.sender, pending);
        
        emit RewardClaimed(msg.sender, pending);
    }
    
    /**
     * @dev 보상 업데이트
     */
    function updateReward() public {
        if (block.timestamp <= lastRewardTime) {
            return;
        }
        
        if (totalStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 multiplier = block.timestamp - lastRewardTime;
        uint256 reward = multiplier * rewardPerSecond;
        accRewardPerShare += (reward * 1e12) / totalStaked;
        lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev 펜딩 보상 확인
     */
    function pendingReward(address _user) external view returns (uint256) {
        Stake memory userStake = stakes[_user];
        uint256 tempAccRewardPerShare = accRewardPerShare;
        
        if (block.timestamp > lastRewardTime && totalStaked != 0) {
            uint256 multiplier = block.timestamp - lastRewardTime;
            uint256 reward = multiplier * rewardPerSecond;
            tempAccRewardPerShare += (reward * 1e12) / totalStaked;
        }
        
        return (userStake.amount * tempAccRewardPerShare / 1e12) - userStake.rewardDebt;
    }
    
    /**
     * @dev 사용자 스테이킹 정보 조회
     */
    function getUserStakeInfo(address _user) external view returns (
        uint256 amount,
        uint256 stakingTime,
        uint256 lockPeriod,
        uint256 unlockTime,
        uint256 pendingRewards
    ) {
        Stake memory userStake = stakes[_user];
        amount = userStake.amount;
        stakingTime = userStake.stakingTime;
        lockPeriod = userStake.lockPeriod;
        unlockTime = userStake.lockPeriod > 0 ? 
            userStake.stakingTime + (userStake.lockPeriod * 1 days) : 0;
        
        // Calculate pending rewards
        uint256 tempAccRewardPerShare = accRewardPerShare;
        if (block.timestamp > lastRewardTime && totalStaked != 0) {
            uint256 multiplier = block.timestamp - lastRewardTime;
            uint256 reward = multiplier * rewardPerSecond;
            tempAccRewardPerShare += (reward * 1e12) / totalStaked;
        }
        pendingRewards = (userStake.amount * tempAccRewardPerShare / 1e12) - userStake.rewardDebt;
    }
    
    // Owner functions
    function setRewardRate(uint256 _rewardPerSecond) external onlyOwner {
        updateReward();
        rewardPerSecond = _rewardPerSecond;
        emit RewardRateUpdated(rewardPerSecond, _rewardPerSecond);
    }
    
    function setLockPeriodReward(uint256 _lockPeriod, uint256 _rewardRate) external onlyOwner {
        lockPeriodRewards[_lockPeriod] = _rewardRate;
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
