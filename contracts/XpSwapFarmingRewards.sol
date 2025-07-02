// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title XpSwapFarmingRewards
 * @dev Yield farming contract for LP token staking with governance token rewards
 * Implements time-weighted reward distribution with boosting mechanisms
 */
contract XpSwapFarmingRewards is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using Math for uint256;
    
    // Tokens
    IERC20 public immutable stakingToken; // LP token
    IERC20 public immutable rewardsToken; // Governance token
    
    // Reward configuration
    uint256 public rewardRate; // Rewards per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public periodFinish = 0;
    uint256 public rewardsDuration = 7 days;
    
    // Boosting mechanism
    uint256 public constant MAX_BOOST = 250; // 2.5x max boost
    uint256 public constant BASE_BOOST = 100; // 1x base boost
    uint256 public constant BOOST_DENOMINATOR = 100;
    
    // Staking data
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public lastStakeTime;
    
    // Boost calculation
    mapping(address => uint256) public governanceTokenBalance;
    uint256 public totalGovernanceStaked;
    
    // Pool statistics
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    
    // Time-based multipliers
    struct TimeMultiplier {
        uint256 duration;
        uint256 multiplier; // In basis points (10000 = 100%)
    }
    
    TimeMultiplier[] public timeMultipliers;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event GovernanceTokenStaked(address indexed user, uint256 amount);
    event GovernanceTokenWithdrawn(address indexed user, uint256 amount);
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    constructor(
        address _stakingToken,
        address _rewardsToken
    ) {
        require(_stakingToken != address(0) && _rewardsToken != address(0), "Invalid token addresses");
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        
        // Initialize time multipliers
        timeMultipliers.push(TimeMultiplier(30 days, 11000));   // 1.1x after 30 days
        timeMultipliers.push(TimeMultiplier(90 days, 12500));   // 1.25x after 90 days
        timeMultipliers.push(TimeMultiplier(180 days, 15000));  // 1.5x after 180 days
        timeMultipliers.push(TimeMultiplier(365 days, 20000));  // 2x after 365 days
    }
    
    /**
     * @dev Stake LP tokens
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        stakedBalance[msg.sender] += amount;
        
        if (stakedBalance[msg.sender] == amount) {
            stakingStartTime[msg.sender] = block.timestamp;
        }
        lastStakeTime[msg.sender] = block.timestamp;
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw staked LP tokens
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");
        
        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;
        
        if (stakedBalance[msg.sender] == 0) {
            stakingStartTime[msg.sender] = 0;
        }
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Claim accumulated rewards
     */
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            totalRewardsPaid += reward;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    /**
     * @dev Withdraw all staked tokens and claim rewards
     */
    function exit() external {
        withdraw(stakedBalance[msg.sender]);
        getReward();
    }
    
    /**
     * @dev Stake governance tokens for boosting rewards
     * @param amount Amount of governance tokens to stake
     */
    function stakeGovernanceToken(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(stakedBalance[msg.sender] > 0, "Must have LP tokens staked");
        
        governanceTokenBalance[msg.sender] += amount;
        totalGovernanceStaked += amount;
        
        rewardsToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit GovernanceTokenStaked(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw governance tokens
     * @param amount Amount to withdraw
     */
    function withdrawGovernanceToken(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        require(governanceTokenBalance[msg.sender] >= amount, "Insufficient balance");
        
        governanceTokenBalance[msg.sender] -= amount;
        totalGovernanceStaked -= amount;
        
        rewardsToken.safeTransfer(msg.sender, amount);
        
        emit GovernanceTokenWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Calculate current reward rate per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }
    
    /**
     * @dev Calculate earned rewards for user
     * @param account User address
     */
    function earned(address account) public view returns (uint256) {
        uint256 baseReward = (stakedBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + rewards[account];
        
        // Apply boost and time multipliers
        uint256 boost = getBoostMultiplier(account);
        uint256 timeMultiplier = getTimeMultiplier(account);
        
        return (baseReward * boost * timeMultiplier) / (BOOST_DENOMINATOR * 10000);
    }
    
    /**
     * @dev Get boost multiplier for user based on governance token staking
     * @param account User address
     */
    function getBoostMultiplier(address account) public view returns (uint256) {
        if (stakedBalance[account] == 0 || totalGovernanceStaked == 0) {
            return BASE_BOOST;
        }
        
        // Calculate boost based on governance token ratio
        uint256 governanceRatio = (governanceTokenBalance[account] * 1e18) / stakedBalance[account];
        uint256 maxGovernanceRatio = 1e18; // 1:1 ratio for max boost
        
        if (governanceRatio >= maxGovernanceRatio) {
            return MAX_BOOST;
        }
        
        // Linear interpolation between base and max boost
        uint256 boostIncrease = ((MAX_BOOST - BASE_BOOST) * governanceRatio) / maxGovernanceRatio;
        return BASE_BOOST + boostIncrease;
    }
    
    /**
     * @dev Get time-based multiplier for user
     * @param account User address
     */
    function getTimeMultiplier(address account) public view returns (uint256) {
        if (stakingStartTime[account] == 0) {
            return 10000; // 1x multiplier
        }
        
        uint256 stakingDuration = block.timestamp - stakingStartTime[account];
        
        for (uint256 i = timeMultipliers.length; i > 0; i--) {
            if (stakingDuration >= timeMultipliers[i - 1].duration) {
                return timeMultipliers[i - 1].multiplier;
            }
        }
        
        return 10000; // 1x multiplier
    }
    
    /**
     * @dev Get user's staking information
     * @param account User address
     */
    function getUserInfo(address account) external view returns (
        uint256 staked,
        uint256 earned_,
        uint256 boost,
        uint256 timeMultiplier,
        uint256 stakingDuration,
        uint256 governanceStaked
    ) {
        staked = stakedBalance[account];
        earned_ = earned(account);
        boost = getBoostMultiplier(account);
        timeMultiplier = getTimeMultiplier(account);
        stakingDuration = stakingStartTime[account] > 0 ? block.timestamp - stakingStartTime[account] : 0;
        governanceStaked = governanceTokenBalance[account];
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo() external view returns (
        uint256 totalStaked_,
        uint256 rewardRate_,
        uint256 periodFinish_,
        uint256 lastUpdateTime_,
        uint256 rewardPerToken_,
        uint256 totalRewardsPaid_
    ) {
        totalStaked_ = totalStaked;
        rewardRate_ = rewardRate;
        periodFinish_ = periodFinish;
        lastUpdateTime_ = lastUpdateTime;
        rewardPerToken_ = rewardPerToken();
        totalRewardsPaid_ = totalRewardsPaid;
    }
    
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }
    
    // Admin functions
    
    /**
     * @dev Add rewards to the pool
     * @param reward Amount of rewards to add
     */
    function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardsDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardsDuration;
        }
        
        // Ensure the provided reward amount is not more than the balance in the contract
        uint256 balance = rewardsToken.balanceOf(address(this)) - totalGovernanceStaked;
        require(rewardRate <= balance / rewardsDuration, "Provided reward too high");
        
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;
        
        emit RewardAdded(reward);
    }
    
    /**
     * @dev Update rewards duration
     * @param _rewardsDuration New duration in seconds
     */
    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }
    
    /**
     * @dev Add or update time multiplier
     * @param duration Duration in seconds
     * @param multiplier Multiplier in basis points
     */
    function setTimeMultiplier(uint256 duration, uint256 multiplier) external onlyOwner {
        require(multiplier >= 10000 && multiplier <= 30000, "Invalid multiplier"); // 1x to 3x
        
        // Find existing multiplier or add new one
        bool found = false;
        for (uint256 i = 0; i < timeMultipliers.length; i++) {
            if (timeMultipliers[i].duration == duration) {
                timeMultipliers[i].multiplier = multiplier;
                found = true;
                break;
            }
        }
        
        if (!found) {
            timeMultipliers.push(TimeMultiplier(duration, multiplier));
        }
    }
    
    /**
     * @dev Emergency withdraw function (owner only)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(stakingToken), "Cannot withdraw staking token");
        IERC20(token).safeTransfer(owner(), amount);
    }
}