// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IXpSwapToken {
    function mintStakingRewards(address recipient, uint256 amount) external;
    function burn(uint256 amount) external;
}

/**
 * @title XpSwap Staking Contract
 * @dev Stake XPS tokens to earn rewards and boost LP farming
 * Features:
 * - Multiple staking tiers with different lock periods
 * - Automatic compound rewards
 * - Boost multipliers for LP farming
 * - Emergency withdrawal with penalties
 * - Anti-whale mechanisms
 */
contract XpSwapStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable xpsToken;
    IXpSwapToken public immutable xpsTokenMint;
    
    // Staking tiers
    struct StakingTier {
        uint256 lockPeriod;        // Lock period in seconds
        uint256 apy;               // APY in basis points (10000 = 100%)
        uint256 boostMultiplier;   // Boost for LP farming (10000 = 1x)
        uint256 minStake;          // Minimum stake amount
        uint256 maxStake;          // Maximum stake amount (anti-whale)
        bool active;               // Tier is active
    }
    
    // User stake information
    struct UserStake {
        uint256 amount;            // Staked amount
        uint256 tier;              // Staking tier
        uint256 startTime;         // Stake start time
        uint256 lastRewardTime;    // Last reward calculation time
        uint256 pendingRewards;    // Accumulated pending rewards
        bool autoCompound;         // Auto-compound enabled
    }
    
    // Mapping from tier ID to tier info
    mapping(uint256 => StakingTier) public stakingTiers;
    
    // Mapping from user to their stakes
    mapping(address => UserStake[]) public userStakes;
    
    // Global statistics
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public totalStakers;
    
    // Protocol settings
    uint256 public constant EMERGENCY_WITHDRAWAL_FEE = 2500; // 25%
    uint256 public constant REWARD_POOL_ALLOCATION = 20; // 20% of XPS max supply
    uint256 public rewardPoolRemaining;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 tier, uint256 stakeIndex);
    event Unstaked(address indexed user, uint256 amount, uint256 tier, uint256 stakeIndex);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 stakeIndex);
    event AutoCompounded(address indexed user, uint256 amount, uint256 stakeIndex);
    event EmergencyWithdrawal(address indexed user, uint256 amount, uint256 penalty);
    event TierUpdated(uint256 tier, uint256 lockPeriod, uint256 apy, uint256 boostMultiplier);
    
    constructor(address _xpsToken) {
        require(_xpsToken != address(0), "Invalid XPS token address");
        xpsToken = IERC20(_xpsToken);
        xpsTokenMint = IXpSwapToken(_xpsToken);
        
        // Initialize staking tiers
        _initializeStakingTiers();
        
        // Set initial reward pool (20% of max supply)
        rewardPoolRemaining = 200_000_000 * 10**18; // 200M XPS
    }
    
    /**
     * @dev Initialize default staking tiers
     */
    function _initializeStakingTiers() internal {
        // Tier 0: 30 days, 50% APY, 1.2x boost
        stakingTiers[0] = StakingTier({
            lockPeriod: 30 days,
            apy: 5000,
            boostMultiplier: 12000,
            minStake: 100 * 10**18,      // 100 XPS
            maxStake: 100000 * 10**18,   // 100k XPS
            active: true
        });
        
        // Tier 1: 90 days, 100% APY, 1.5x boost
        stakingTiers[1] = StakingTier({
            lockPeriod: 90 days,
            apy: 10000,
            boostMultiplier: 15000,
            minStake: 500 * 10**18,      // 500 XPS
            maxStake: 250000 * 10**18,   // 250k XPS
            active: true
        });
        
        // Tier 2: 180 days, 200% APY, 2x boost
        stakingTiers[2] = StakingTier({
            lockPeriod: 180 days,
            apy: 20000,
            boostMultiplier: 20000,
            minStake: 1000 * 10**18,     // 1k XPS
            maxStake: 500000 * 10**18,   // 500k XPS
            active: true
        });
        
        // Tier 3: 365 days, 400% APY, 2.5x boost
        stakingTiers[3] = StakingTier({
            lockPeriod: 365 days,
            apy: 40000,
            boostMultiplier: 25000,
            minStake: 5000 * 10**18,     // 5k XPS
            maxStake: 1000000 * 10**18,  // 1M XPS
            active: true
        });
    }
    
    /**
     * @dev Stake XPS tokens
     */
    function stake(
        uint256 amount, 
        uint256 tier, 
        bool autoCompound
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingTiers[tier].active, "Tier not active");
        require(
            amount >= stakingTiers[tier].minStake, 
            "Amount below minimum stake"
        );
        require(
            amount <= stakingTiers[tier].maxStake, 
            "Amount exceeds maximum stake"
        );
        
        // Check if user is new staker
        bool isNewStaker = userStakes[msg.sender].length == 0;
        
        // Transfer tokens from user
        xpsToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create new stake
        UserStake memory newStake = UserStake({
            amount: amount,
            tier: tier,
            startTime: block.timestamp,
            lastRewardTime: block.timestamp,
            pendingRewards: 0,
            autoCompound: autoCompound
        });
        
        userStakes[msg.sender].push(newStake);
        totalStaked += amount;
        
        if (isNewStaker) {
            totalStakers++;
        }
        
        emit Staked(msg.sender, amount, tier, userStakes[msg.sender].length - 1);
    }
    
    /**
     * @dev Calculate pending rewards for a stake
     */
    function calculatePendingRewards(address user, uint256 stakeIndex) 
        public 
        view 
        returns (uint256) 
    {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        UserStake memory userStake = userStakes[user][stakeIndex];
        StakingTier memory tier = stakingTiers[userStake.tier];
        
        uint256 timeStaked = block.timestamp - userStake.lastRewardTime;
        uint256 annualReward = (userStake.amount * tier.apy) / 10000;
        uint256 reward = (annualReward * timeStaked) / 365 days;
        
        return userStake.pendingRewards + reward;
    }
    
    /**
     * @dev Update rewards for a specific stake
     */
    function _updateRewards(address user, uint256 stakeIndex) internal {
        UserStake storage userStake = userStakes[user][stakeIndex];
        
        uint256 pendingReward = calculatePendingRewards(user, stakeIndex);
        userStake.pendingRewards = pendingReward;
        userStake.lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev Claim rewards for a specific stake
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        _updateRewards(msg.sender, stakeIndex);
        
        UserStake storage userStake = userStakes[msg.sender][stakeIndex];
        uint256 rewards = userStake.pendingRewards;
        
        require(rewards > 0, "No rewards to claim");
        require(rewardPoolRemaining >= rewards, "Insufficient reward pool");
        
        userStake.pendingRewards = 0;
        rewardPoolRemaining -= rewards;
        totalRewardsDistributed += rewards;
        
        if (userStake.autoCompound) {
            // Auto-compound: add rewards to stake
            userStake.amount += rewards;
            totalStaked += rewards;
            emit AutoCompounded(msg.sender, rewards, stakeIndex);
        } else {
            // Direct reward distribution
            xpsTokenMint.mintStakingRewards(msg.sender, rewards);
        }
        
        emit RewardsClaimed(msg.sender, rewards, stakeIndex);
    }
    
    /**
     * @dev Unstake tokens after lock period
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        UserStake storage userStake = userStakes[msg.sender][stakeIndex];
        StakingTier memory tier = stakingTiers[userStake.tier];
        
        require(
            block.timestamp >= userStake.startTime + tier.lockPeriod,
            "Tokens still locked"
        );
        
        // Claim any pending rewards first
        _updateRewards(msg.sender, stakeIndex);
        if (userStake.pendingRewards > 0) {
            uint256 rewards = userStake.pendingRewards;
            userStake.pendingRewards = 0;
            rewardPoolRemaining -= rewards;
            totalRewardsDistributed += rewards;
            xpsTokenMint.mintStakingRewards(msg.sender, rewards);
        }
        
        uint256 amount = userStake.amount;
        totalStaked -= amount;
        
        // Remove stake from array
        _removeStake(msg.sender, stakeIndex);
        
        // Check if user has no more stakes
        if (userStakes[msg.sender].length == 0) {
            totalStakers--;
        }
        
        // Transfer staked tokens back to user
        xpsToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, tier.lockPeriod, stakeIndex);
    }
    
    /**
     * @dev Emergency withdrawal with penalty
     */
    function emergencyWithdraw(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        UserStake storage userStake = userStakes[msg.sender][stakeIndex];
        uint256 amount = userStake.amount;
        
        // Calculate penalty
        uint256 penalty = (amount * EMERGENCY_WITHDRAWAL_FEE) / 10000;
        uint256 amountAfterPenalty = amount - penalty;
        
        totalStaked -= amount;
        
        // Remove stake from array
        _removeStake(msg.sender, stakeIndex);
        
        // Check if user has no more stakes
        if (userStakes[msg.sender].length == 0) {
            totalStakers--;
        }
        
        // Burn penalty tokens (deflationary mechanism)
        if (penalty > 0) {
            xpsTokenMint.burn(penalty);
        }
        
        // Transfer remaining tokens to user
        xpsToken.safeTransfer(msg.sender, amountAfterPenalty);
        
        emit EmergencyWithdrawal(msg.sender, amountAfterPenalty, penalty);
    }
    
    /**
     * @dev Remove stake from user's array
     */
    function _removeStake(address user, uint256 stakeIndex) internal {
        UserStake[] storage stakes = userStakes[user];
        require(stakeIndex < stakes.length, "Invalid stake index");
        
        // Move last element to deleted spot and remove last element
        if (stakeIndex != stakes.length - 1) {
            stakes[stakeIndex] = stakes[stakes.length - 1];
        }
        stakes.pop();
    }
    
    /**
     * @dev Get user's boost multiplier for LP farming
     */
    function getUserBoostMultiplier(address user) external view returns (uint256) {
        UserStake[] memory stakes = userStakes[user];
        uint256 maxBoost = 10000; // 1x base multiplier
        
        for (uint256 i = 0; i < stakes.length; i++) {
            StakingTier memory tier = stakingTiers[stakes[i].tier];
            if (tier.boostMultiplier > maxBoost) {
                maxBoost = tier.boostMultiplier;
            }
        }
        
        return maxBoost;
    }
    
    /**
     * @dev Get user's total staked amount
     */
    function getUserTotalStaked(address user) external view returns (uint256) {
        UserStake[] memory stakes = userStakes[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < stakes.length; i++) {
            total += stakes[i].amount;
        }
        
        return total;
    }
    
    /**
     * @dev Get user's stake count
     */
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }
    
    /**
     * @dev Get user's stake information
     */
    function getUserStake(address user, uint256 stakeIndex) 
        external 
        view 
        returns (
            uint256 amount,
            uint256 tier,
            uint256 startTime,
            uint256 lastRewardTime,
            uint256 pendingRewards,
            bool autoCompound,
            uint256 unlockTime
        ) 
    {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        UserStake memory userStake = userStakes[user][stakeIndex];
        StakingTier memory stakingTier = stakingTiers[userStake.tier];
        
        return (
            userStake.amount,
            userStake.tier,
            userStake.startTime,
            userStake.lastRewardTime,
            calculatePendingRewards(user, stakeIndex),
            userStake.autoCompound,
            userStake.startTime + stakingTier.lockPeriod
        );
    }
    
    /**
     * @dev Update staking tier (only owner)
     */
    function updateStakingTier(
        uint256 tier,
        uint256 lockPeriod,
        uint256 apy,
        uint256 boostMultiplier,
        uint256 minStake,
        uint256 maxStake,
        bool active
    ) external onlyOwner {
        stakingTiers[tier] = StakingTier({
            lockPeriod: lockPeriod,
            apy: apy,
            boostMultiplier: boostMultiplier,
            minStake: minStake,
            maxStake: maxStake,
            active: active
        });
        
        emit TierUpdated(tier, lockPeriod, apy, boostMultiplier);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 _totalStaked,
            uint256 _totalStakers,
            uint256 _totalRewardsDistributed,
            uint256 _rewardPoolRemaining
        ) 
    {
        return (totalStaked, totalStakers, totalRewardsDistributed, rewardPoolRemaining);
    }
}