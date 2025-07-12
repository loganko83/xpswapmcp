// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XPS Token - XpSwap Platform Utility Token
 * @dev Advanced ERC20 token with deflationary mechanisms, fee discounts, and governance features
 */
contract XPSToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {

    // ============ Constants ============
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion XPS
    uint256 public constant REVENUE_BURN_RATE = 4000; // 40% (basis points)
    uint256 public constant EMERGENCY_WITHDRAW_PENALTY = 2500; // 25%
    uint256 public constant BASIS_POINTS = 10000;

    // ============ State Variables ============
    uint256 public totalBurned;
    uint256 public protocolRevenue;
    
    // Fee discount tiers
    mapping(uint256 => uint256) public feeDiscountTiers; // balance => discount (basis points)
    
    // Staking information
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => uint256) public delegatedVotes;
    
    // Protocol settings
    address public xpSwapProtocol;
    bool public stakingEnabled = true;
    bool public burningEnabled = true;

    // ============ Structs ============
    struct StakingInfo {
        uint256 stakedAmount;
        uint256 stakingStartTime;
        uint256 rewardsEarned;
        uint256 lockPeriod; // 30 days to 365 days
        bool emergencyWithdraw;
    }

    // ============ Events ============
    event TokensBurned(uint256 amount, string reason);
    event RevenueDistributed(uint256 totalRevenue, uint256 burnAmount);
    event StakingReward(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 penalty);
    event FeeDiscountApplied(address indexed user, uint256 discount);

    constructor() ERC20("XpSwap Token", "XPS") Ownable(msg.sender) {
        // Initial mint to deployer (will be distributed according to tokenomics)
        _mint(msg.sender, MAX_SUPPLY);
        
        // Initialize fee discount tiers
        feeDiscountTiers[1000 * 10**18] = 1000;    // 1,000 XPS = 10% discount
        feeDiscountTiers[5000 * 10**18] = 2000;    // 5,000 XPS = 20% discount
        feeDiscountTiers[10000 * 10**18] = 3000;   // 10,000 XPS = 30% discount
        feeDiscountTiers[50000 * 10**18] = 5000;   // 50,000 XPS = 50% discount
        feeDiscountTiers[100000 * 10**18] = 7500;  // 100,000 XPS = 75% discount
    }

    // ============ Core Token Functions ============

    /**
     * @dev Burn tokens from protocol revenue
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnFromRevenue(uint256 amount, string memory reason) external {
        require(msg.sender == xpSwapProtocol || msg.sender == owner(), "Unauthorized");
        require(burningEnabled, "Burning disabled");
        require(amount > 0, "Amount must be greater than 0");
        
        _burn(address(this), amount);
        totalBurned = totalBurned + amount;
        
        emit TokensBurned(amount, reason);
    }

    /**
     * @dev Distribute protocol revenue (40% burn, 60% to team/development)
     * @param totalRevenue Total revenue to distribute
     */
    function distributeRevenue(uint256 totalRevenue) external nonReentrant {
        require(msg.sender == xpSwapProtocol || msg.sender == owner(), "Unauthorized");
        require(totalRevenue > 0, "Revenue must be greater than 0");
        
        uint256 burnAmount = totalRevenue * REVENUE_BURN_RATE / BASIS_POINTS;
        
        // Buy back XPS tokens and burn them
        if (burnAmount > 0 && burningEnabled) {
            _burn(address(this), burnAmount);
            totalBurned = totalBurned + burnAmount;
        }
        
        protocolRevenue = protocolRevenue + totalRevenue;
        
        emit RevenueDistributed(totalRevenue, burnAmount);
    }

    // ============ Fee Discount System ============

    /**
     * @dev Calculate fee discount for a user based on XPS balance
     * @param user User address
     * @return discount Discount in basis points (0-7500)
     */
    function calculateFeeDiscount(address user) external view returns (uint256 discount) {
        uint256 balance = balanceOf(user) + stakingInfo[user].stakedAmount;
        
        // Check tiers from highest to lowest
        if (balance >= 100000 * 10**18) return 7500; // 75%
        if (balance >= 50000 * 10**18) return 5000;  // 50%
        if (balance >= 10000 * 10**18) return 3000;  // 30%
        if (balance >= 5000 * 10**18) return 2000;   // 20%
        if (balance >= 1000 * 10**18) return 1000;   // 10%
        
        return 0;
    }

    /**
     * @dev Get effective trading fee after XPS discount
     * @param user User address
     * @param baseFee Base fee in basis points (e.g., 300 for 3%)
     * @return effectiveFee Effective fee after discount
     */
    function getEffectiveFee(address user, uint256 baseFee) external view returns (uint256 effectiveFee) {
        uint256 discount = this.calculateFeeDiscount(user);
        uint256 discountAmount = baseFee * discount / BASIS_POINTS;
        return baseFee - discountAmount;
    }

    // ============ Staking System ============

    /**
     * @dev Stake XPS tokens for rewards and governance
     * @param amount Amount to stake
     * @param lockPeriod Lock period in days (30-365)
     */
    function stakeTokens(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(stakingEnabled, "Staking disabled");
        require(amount > 0, "Amount must be greater than 0");
        require(lockPeriod >= 30 && lockPeriod <= 365, "Invalid lock period");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking info
        StakingInfo storage info = stakingInfo[msg.sender];
        info.stakedAmount = info.stakedAmount + amount;
        info.stakingStartTime = block.timestamp;
        info.lockPeriod = lockPeriod;
        info.emergencyWithdraw = false;
    }

    /**
     * @dev Calculate staking rewards based on time and lock period
     * @param user User address
     * @return rewards Calculated rewards
     */
    function calculateStakingRewards(address user) public view returns (uint256 rewards) {
        StakingInfo memory info = stakingInfo[user];
        if (info.stakedAmount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - info.stakingStartTime;
        uint256 baseAPY = 10000; // 100% base APY
        
        // Time multiplier based on lock period
        uint256 timeMultiplier = BASIS_POINTS; // 1x for 30 days
        if (info.lockPeriod >= 365) timeMultiplier = 40000; // 4x for 365 days
        else if (info.lockPeriod >= 180) timeMultiplier = 25000; // 2.5x for 180 days
        else if (info.lockPeriod >= 90) timeMultiplier = 15000;  // 1.5x for 90 days
        
        // Calculate annual rewards and pro-rate for staking duration
        uint256 annualRewards = info.stakedAmount * baseAPY * timeMultiplier / BASIS_POINTS / BASIS_POINTS;
        rewards = annualRewards * stakingDuration / 365 days;
        
        return rewards - info.rewardsEarned;
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant {
        uint256 rewards = calculateStakingRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        stakingInfo[msg.sender].rewardsEarned = stakingInfo[msg.sender].rewardsEarned + rewards;
        
        // Mint rewards (or transfer from reward pool)
        _mint(msg.sender, rewards);
        
        emit StakingReward(msg.sender, rewards);
    }

    /**
     * @dev Emergency withdraw with penalty
     */
    function emergencyWithdraw() external nonReentrant {
        StakingInfo storage info = stakingInfo[msg.sender];
        require(info.stakedAmount > 0, "No staked tokens");
        
        uint256 penalty = info.stakedAmount * EMERGENCY_WITHDRAW_PENALTY / BASIS_POINTS;
        uint256 withdrawAmount = info.stakedAmount - penalty;
        
        // Burn penalty tokens
        if (penalty > 0 && burningEnabled) {
            _burn(address(this), penalty);
            totalBurned = totalBurned + penalty;
        }
        
        // Transfer remaining tokens back to user
        _transfer(address(this), msg.sender, withdrawAmount);
        
        info.stakedAmount = 0;
        info.emergencyWithdraw = true;
        
        emit EmergencyWithdraw(msg.sender, withdrawAmount, penalty);
    }

    // ============ Governance Functions ============

    /**
     * @dev Delegate voting power to another address
     * @param delegatee Address to delegate votes to
     */
    function delegate(address delegatee) external {
        delegatedVotes[msg.sender] = delegatee != address(0) ? 
            balanceOf(msg.sender) + stakingInfo[msg.sender].stakedAmount : 0;
    }

    /**
     * @dev Get voting power for an address
     * @param account Account to check
     * @return votes Total voting power
     */
    function getVotingPower(address account) external view returns (uint256 votes) {
        // Direct balance + staked amount + delegated votes
        votes = balanceOf(account) + stakingInfo[account].stakedAmount;
        
        // Add delegated votes (simplified - would need more complex tracking in production)
        return votes;
    }

    // ============ Admin Functions ============

    function setXpSwapProtocol(address _protocol) external onlyOwner {
        xpSwapProtocol = _protocol;
    }

    function setStakingEnabled(bool _enabled) external onlyOwner {
        stakingEnabled = _enabled;
    }

    function setBurningEnabled(bool _enabled) external onlyOwner {
        burningEnabled = _enabled;
    }

    function updateFeeDiscountTier(uint256 balance, uint256 discount) external onlyOwner {
        require(discount <= 7500, "Discount too high"); // Max 75%
        feeDiscountTiers[balance] = discount;
    }

    // ============ View Functions ============

    function getTokenInfo() external view returns (
        uint256 _totalSupply,
        uint256 _totalBurned,
        uint256 _circulatingSupply,
        uint256 _protocolRevenue
    ) {
        _totalSupply = totalSupply();
        _totalBurned = totalBurned;
        _circulatingSupply = totalSupply() - balanceOf(address(this));
        _protocolRevenue = protocolRevenue;
    }

    function getUserStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakingDuration,
        uint256 pendingRewards,
        uint256 lockPeriod,
        uint256 feeDiscount
    ) {
        StakingInfo memory info = stakingInfo[user];
        stakedAmount = info.stakedAmount;
        stakingDuration = info.stakingStartTime > 0 ? block.timestamp - info.stakingStartTime : 0;
        pendingRewards = calculateStakingRewards(user);
        lockPeriod = info.lockPeriod;
        feeDiscount = this.calculateFeeDiscount(user);
    }
}
