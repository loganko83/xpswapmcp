// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title XpSwapFarmingRewards
 * @dev 유동성 풀 토큰 파밍 보상 시스템
 */
contract XpSwapFarmingRewards is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable rewardToken;
    
    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 lastRewardTime;
        uint256 accRewardPerShare;
        uint256 totalStaked;
        uint256 minStakeAmount;
        uint256 lockPeriod; // in seconds
        bool active;
    }
    
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 totalRewardsClaimed;
    }
    
    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    uint256 public rewardPerSecond;
    uint256 public totalAllocPoint;
    uint256 public startTime;
    uint256 public constant REWARD_PRECISION = 1e12;
    
    // Bonus multipliers
    mapping(uint256 => uint256) public poolMultipliers;
    
    event PoolAdded(uint256 indexed pid, address lpToken, uint256 allocPoint);
    event PoolUpdated(uint256 indexed pid, uint256 allocPoint);
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event RewardClaimed(address indexed user, uint256 indexed pid, uint256 amount);
    
    constructor(
        address _rewardToken,
        uint256 _rewardPerSecond,
        uint256 _startTime
    ) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
        rewardPerSecond = _rewardPerSecond;
        startTime = _startTime == 0 ? block.timestamp : _startTime;
    }
    
    /**
     * @dev 풀 개수 반환
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
    
    /**
     * @dev 새 풀 추가 (Owner only)
     */
    function addPool(
        address _lpToken,
        uint256 _allocPoint,
        uint256 _minStakeAmount,
        uint256 _lockPeriod,
        bool _withUpdate
    ) external onlyOwner {
        require(_lpToken != address(0), "Invalid LP token address");
        
        if (_withUpdate) {
            massUpdatePools();
        }
        
        uint256 lastRewardTime = block.timestamp > startTime ? block.timestamp : startTime;
        totalAllocPoint += _allocPoint;
        
        poolInfo.push(PoolInfo({
            lpToken: IERC20(_lpToken),
            allocPoint: _allocPoint,
            lastRewardTime: lastRewardTime,
            accRewardPerShare: 0,
            totalStaked: 0,
            minStakeAmount: _minStakeAmount,
            lockPeriod: _lockPeriod,
            active: true
        }));
        
        uint256 pid = poolInfo.length - 1;
        poolMultipliers[pid] = 100; // 100% base multiplier
        
        emit PoolAdded(pid, _lpToken, _allocPoint);
    }
    
    /**
     * @dev 풀 정보 업데이트 (Owner only)
     */
    function updatePool(
        uint256 _pid,
        uint256 _allocPoint,
        uint256 _minStakeAmount,
        uint256 _lockPeriod,
        bool _active
    ) external onlyOwner {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        massUpdatePools();
        
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].minStakeAmount = _minStakeAmount;
        poolInfo[_pid].lockPeriod = _lockPeriod;
        poolInfo[_pid].active = _active;
        
        emit PoolUpdated(_pid, _allocPoint);
    }
    
    /**
     * @dev 풀 보상 업데이트
     */
    function updatePoolReward(uint256 _pid) public {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        PoolInfo storage pool = poolInfo[_pid];
        
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }
        
        if (pool.totalStaked == 0 || pool.allocPoint == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 multiplier = block.timestamp - pool.lastRewardTime;
        uint256 reward = multiplier * rewardPerSecond * pool.allocPoint / totalAllocPoint;
        
        // Apply pool multiplier
        reward = reward * poolMultipliers[_pid] / 100;
        
        pool.accRewardPerShare += (reward * REWARD_PRECISION) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev 모든 풀 보상 업데이트
     */
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; pid++) {
            updatePoolReward(pid);
        }
    }
    
    /**
     * @dev LP 토큰 예치
     */
    function deposit(uint256 _pid, uint256 _amount) external nonReentrant whenNotPaused {
        require(_pid < poolInfo.length, "Invalid pool ID");
        require(_amount > 0, "Amount must be greater than 0");
        
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(pool.active, "Pool is not active");
        require(_amount >= pool.minStakeAmount, "Amount below minimum stake");
        
        updatePoolReward(_pid);
        
        // Claim pending rewards
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare / REWARD_PRECISION) - user.rewardDebt;
            if (pending > 0) {
                safeRewardTransfer(msg.sender, pending);
                user.totalRewardsClaimed += pending;
                emit RewardClaimed(msg.sender, _pid, pending);
            }
        }
        
        // Transfer LP tokens
        pool.lpToken.transferFrom(msg.sender, address(this), _amount);
        
        // Update user info
        user.amount += _amount;
        user.lastStakeTime = block.timestamp;
        user.rewardDebt = user.amount * pool.accRewardPerShare / REWARD_PRECISION;
        
        // Update pool info
        pool.totalStaked += _amount;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    /**
     * @dev LP 토큰 출금
     */
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(user.amount >= _amount, "Insufficient balance");
        
        // Check lock period
        if (pool.lockPeriod > 0) {
            require(
                block.timestamp >= user.lastStakeTime + pool.lockPeriod,
                "Tokens are still locked"
            );
        }
        
        updatePoolReward(_pid);
        
        // Claim pending rewards
        uint256 pending = (user.amount * pool.accRewardPerShare / REWARD_PRECISION) - user.rewardDebt;
        if (pending > 0) {
            safeRewardTransfer(msg.sender, pending);
            user.totalRewardsClaimed += pending;
            emit RewardClaimed(msg.sender, _pid, pending);
        }
        
        // Update user info
        user.amount -= _amount;
        user.rewardDebt = user.amount * pool.accRewardPerShare / REWARD_PRECISION;
        
        // Update pool info
        pool.totalStaked -= _amount;
        
        // Transfer LP tokens
        pool.lpToken.transfer(msg.sender, _amount);
        
        emit Withdraw(msg.sender, _pid, _amount);
    }
    
    /**
     * @dev 보상만 청구
     */
    function claimReward(uint256 _pid) external nonReentrant {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePoolReward(_pid);
        
        uint256 pending = (user.amount * pool.accRewardPerShare / REWARD_PRECISION) - user.rewardDebt;
        require(pending > 0, "No reward to claim");
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / REWARD_PRECISION;
        user.totalRewardsClaimed += pending;
        
        safeRewardTransfer(msg.sender, pending);
        emit RewardClaimed(msg.sender, _pid, pending);
    }
    
    /**
     * @dev 긴급 출금 (보상 없이)
     */
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        uint256 amount = user.amount;
        require(amount > 0, "No balance to withdraw");
        
        user.amount = 0;
        user.rewardDebt = 0;
        pool.totalStaked -= amount;
        
        pool.lpToken.transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }
    
    /**
     * @dev 펜딩 보상 확인
     */
    function pendingReward(uint256 _pid, address _user) external view returns (uint256) {
        require(_pid < poolInfo.length, "Invalid pool ID");
        
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_user];
        
        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked != 0 && pool.allocPoint > 0) {
            uint256 multiplier = block.timestamp - pool.lastRewardTime;
            uint256 reward = multiplier * rewardPerSecond * pool.allocPoint / totalAllocPoint;
            reward = reward * poolMultipliers[_pid] / 100;
            accRewardPerShare += (reward * REWARD_PRECISION) / pool.totalStaked;
        }
        
        return (user.amount * accRewardPerShare / REWARD_PRECISION) - user.rewardDebt;
    }
    
    /**
     * @dev 사용자 정보 조회
     */
    function getUserInfo(uint256 _pid, address _user) external view returns (
        uint256 amount,
        uint256 rewardDebt,
        uint256 lastStakeTime,
        uint256 totalRewardsClaimed,
        uint256 pendingRewards
    ) {
        UserInfo memory user = userInfo[_pid][_user];
        amount = user.amount;
        rewardDebt = user.rewardDebt;
        lastStakeTime = user.lastStakeTime;
        totalRewardsClaimed = user.totalRewardsClaimed;
        
        // Calculate pending rewards
        PoolInfo memory pool = poolInfo[_pid];
        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked != 0 && pool.allocPoint > 0) {
            uint256 multiplier = block.timestamp - pool.lastRewardTime;
            uint256 reward = multiplier * rewardPerSecond * pool.allocPoint / totalAllocPoint;
            reward = reward * poolMultipliers[_pid] / 100;
            accRewardPerShare += (reward * REWARD_PRECISION) / pool.totalStaked;
        }
        
        pendingRewards = (user.amount * accRewardPerShare / REWARD_PRECISION) - user.rewardDebt;
    }
    
    /**
     * @dev 안전한 보상 전송
     */
    function safeRewardTransfer(address _to, uint256 _amount) internal {
        uint256 rewardBal = rewardToken.balanceOf(address(this));
        if (_amount > rewardBal) {
            rewardToken.transfer(_to, rewardBal);
        } else {
            rewardToken.transfer(_to, _amount);
        }
    }
    
    // Owner functions
    function setRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
        massUpdatePools();
        rewardPerSecond = _rewardPerSecond;
    }
    
    function setPoolMultiplier(uint256 _pid, uint256 _multiplier) external onlyOwner {
        require(_pid < poolInfo.length, "Invalid pool ID");
        poolMultipliers[_pid] = _multiplier;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyRewardWithdraw(uint256 _amount) external onlyOwner {
        rewardToken.transfer(owner(), _amount);
    }
}
