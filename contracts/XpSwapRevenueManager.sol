// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IXpSwapToken {
    function burnFromRevenue(uint256 amount, string memory reason) external;
    function mintToCategory(string memory category, address recipient, uint256 amount) external;
    function calculateFeeDiscount(address user) external view returns (uint256);
}

/**
 * @title XpSwap Revenue Manager
 * @dev Manages protocol revenue distribution and XPS burning mechanisms
 * Features:
 * - Revenue collection from trading fees
 * - Automatic XPS burning for deflation
 * - Bug bounty rewards distribution
 * - Marketing budget allocation
 * - Team and development fund management
 */
contract XpSwapRevenueManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IXpSwapToken public immutable xpsToken;
    
    // Revenue allocation percentages (basis points, 10000 = 100%)
    uint256 public constant BURN_ALLOCATION = 4000;        // 40% for burning
    uint256 public constant TEAM_ALLOCATION = 1500;        // 15% for team
    uint256 public constant DEVELOPMENT_ALLOCATION = 1500; // 15% for development
    uint256 public constant MARKETING_ALLOCATION = 1000;   // 10% for marketing
    uint256 public constant BUG_BOUNTY_ALLOCATION = 500;   // 5% for bug bounty
    uint256 public constant RESERVE_ALLOCATION = 1500;     // 15% for reserves
    
    // Addresses for revenue distribution
    address public teamWallet;
    address public developmentWallet;
    address public marketingWallet;
    address public bugBountyWallet;
    address public reserveWallet;
    
    // Revenue tracking
    mapping(address => uint256) public totalRevenueByToken;
    mapping(address => uint256) public totalBurnedByToken;
    uint256 public totalXpsBurned;
    
    // Bug bounty system
    struct BugBounty {
        uint256 id;
        address reporter;
        string severity; // "low", "medium", "high", "critical"
        uint256 reward;
        bool claimed;
        uint256 timestamp;
        string description;
    }
    
    mapping(uint256 => BugBounty) public bugBounties;
    uint256 public nextBountyId;
    uint256 public totalBugBountyPaid;
    
    // Marketing campaigns
    struct MarketingCampaign {
        uint256 id;
        string name;
        uint256 budget;
        uint256 spent;
        address manager;
        bool active;
        uint256 startTime;
        uint256 endTime;
    }
    
    mapping(uint256 => MarketingCampaign) public marketingCampaigns;
    uint256 public nextCampaignId;
    
    // Events
    event RevenueDistributed(
        address indexed token,
        uint256 totalAmount,
        uint256 burnAmount,
        uint256 teamAmount,
        uint256 devAmount,
        uint256 marketingAmount,
        uint256 bugBountyAmount,
        uint256 reserveAmount
    );
    event XpsBurned(uint256 amount, string reason);
    event BugBountyCreated(uint256 indexed bountyId, address indexed reporter, string severity, uint256 reward);
    event BugBountyClaimed(uint256 indexed bountyId, address indexed reporter, uint256 reward);
    event MarketingCampaignCreated(uint256 indexed campaignId, string name, uint256 budget);
    event MarketingExpenseApproved(uint256 indexed campaignId, uint256 amount, address recipient);
    
    constructor(
        address _xpsToken,
        address _teamWallet,
        address _developmentWallet,
        address _marketingWallet,
        address _bugBountyWallet,
        address _reserveWallet
    ) {
        require(_xpsToken != address(0), "Invalid XPS token");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_developmentWallet != address(0), "Invalid development wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_bugBountyWallet != address(0), "Invalid bug bounty wallet");
        require(_reserveWallet != address(0), "Invalid reserve wallet");
        
        xpsToken = IXpSwapToken(_xpsToken);
        teamWallet = _teamWallet;
        developmentWallet = _developmentWallet;
        marketingWallet = _marketingWallet;
        bugBountyWallet = _bugBountyWallet;
        reserveWallet = _reserveWallet;
        
        nextBountyId = 1;
        nextCampaignId = 1;
    }
    
    /**
     * @dev Distribute protocol revenue
     */
    function distributeRevenue(address token, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");
        
        IERC20 revenueToken = IERC20(token);
        require(
            revenueToken.balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        
        // Calculate allocations
        uint256 burnAmount = (amount * BURN_ALLOCATION) / 10000;
        uint256 teamAmount = (amount * TEAM_ALLOCATION) / 10000;
        uint256 devAmount = (amount * DEVELOPMENT_ALLOCATION) / 10000;
        uint256 marketingAmount = (amount * MARKETING_ALLOCATION) / 10000;
        uint256 bugBountyAmount = (amount * BUG_BOUNTY_ALLOCATION) / 10000;
        uint256 reserveAmount = (amount * RESERVE_ALLOCATION) / 10000;
        
        // Handle XPS burning if revenue is in XPS
        if (token == address(xpsToken)) {
            xpsToken.burnFromRevenue(burnAmount, "Protocol revenue burn");
            totalXpsBurned += burnAmount;
        } else {
            // For other tokens, transfer burn allocation to reserve for later conversion
            revenueToken.safeTransfer(reserveWallet, burnAmount);
        }
        
        // Distribute to wallets
        revenueToken.safeTransfer(teamWallet, teamAmount);
        revenueToken.safeTransfer(developmentWallet, devAmount);
        revenueToken.safeTransfer(marketingWallet, marketingAmount);
        revenueToken.safeTransfer(bugBountyWallet, bugBountyAmount);
        revenueToken.safeTransfer(reserveWallet, reserveAmount);
        
        // Update tracking
        totalRevenueByToken[token] += amount;
        if (token == address(xpsToken)) {
            totalBurnedByToken[token] += burnAmount;
        }
        
        emit RevenueDistributed(
            token,
            amount,
            burnAmount,
            teamAmount,
            devAmount,
            marketingAmount,
            bugBountyAmount,
            reserveAmount
        );
    }
    
    /**
     * @dev Create bug bounty reward
     */
    function createBugBounty(
        address reporter,
        string memory severity,
        uint256 reward,
        string memory description
    ) external onlyOwner {
        require(reporter != address(0), "Invalid reporter address");
        require(reward > 0, "Reward must be greater than 0");
        
        bugBounties[nextBountyId] = BugBounty({
            id: nextBountyId,
            reporter: reporter,
            severity: severity,
            reward: reward,
            claimed: false,
            timestamp: block.timestamp,
            description: description
        });
        
        emit BugBountyCreated(nextBountyId, reporter, severity, reward);
        nextBountyId++;
    }
    
    /**
     * @dev Claim bug bounty reward
     */
    function claimBugBounty(uint256 bountyId) external nonReentrant {
        BugBounty storage bounty = bugBounties[bountyId];
        
        require(bounty.reporter == msg.sender, "Not the reporter");
        require(!bounty.claimed, "Bounty already claimed");
        require(bounty.reward > 0, "Invalid bounty");
        
        bounty.claimed = true;
        totalBugBountyPaid += bounty.reward;
        
        // Mint XPS tokens as reward
        xpsToken.mintToCategory("bugBounty", msg.sender, bounty.reward);
        
        emit BugBountyClaimed(bountyId, msg.sender, bounty.reward);
    }
    
    /**
     * @dev Create marketing campaign
     */
    function createMarketingCampaign(
        string memory name,
        uint256 budget,
        address manager,
        uint256 duration
    ) external onlyOwner {
        require(budget > 0, "Budget must be greater than 0");
        require(manager != address(0), "Invalid manager address");
        
        marketingCampaigns[nextCampaignId] = MarketingCampaign({
            id: nextCampaignId,
            name: name,
            budget: budget,
            spent: 0,
            manager: manager,
            active: true,
            startTime: block.timestamp,
            endTime: block.timestamp + duration
        });
        
        emit MarketingCampaignCreated(nextCampaignId, name, budget);
        nextCampaignId++;
    }
    
    /**
     * @dev Approve marketing expense
     */
    function approveMarketingExpense(
        uint256 campaignId,
        uint256 amount,
        address recipient
    ) external onlyOwner nonReentrant {
        MarketingCampaign storage campaign = marketingCampaigns[campaignId];
        
        require(campaign.active, "Campaign not active");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(campaign.spent + amount <= campaign.budget, "Exceeds budget");
        require(recipient != address(0), "Invalid recipient");
        
        campaign.spent += amount;
        
        // Mint XPS tokens for marketing expense
        xpsToken.mintToCategory("marketing", recipient, amount);
        
        emit MarketingExpenseApproved(campaignId, amount, recipient);
    }
    
    /**
     * @dev Emergency burn XPS for deflation
     */
    function emergencyBurnXps(uint256 amount, string memory reason) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        xpsToken.burnFromRevenue(amount, reason);
        totalXpsBurned += amount;
        
        emit XpsBurned(amount, reason);
    }
    
    /**
     * @dev Get bug bounty information
     */
    function getBugBounty(uint256 bountyId)
        external
        view
        returns (
            uint256 id,
            address reporter,
            string memory severity,
            uint256 reward,
            bool claimed,
            uint256 timestamp,
            string memory description
        )
    {
        BugBounty memory bounty = bugBounties[bountyId];
        return (
            bounty.id,
            bounty.reporter,
            bounty.severity,
            bounty.reward,
            bounty.claimed,
            bounty.timestamp,
            bounty.description
        );
    }
    
    /**
     * @dev Get marketing campaign information
     */
    function getMarketingCampaign(uint256 campaignId)
        external
        view
        returns (
            uint256 id,
            string memory name,
            uint256 budget,
            uint256 spent,
            address manager,
            bool active,
            uint256 startTime,
            uint256 endTime
        )
    {
        MarketingCampaign memory campaign = marketingCampaigns[campaignId];
        return (
            campaign.id,
            campaign.name,
            campaign.budget,
            campaign.spent,
            campaign.manager,
            campaign.active,
            campaign.startTime,
            campaign.endTime
        );
    }
    
    /**
     * @dev Get revenue statistics
     */
    function getRevenueStats()
        external
        view
        returns (
            uint256 _totalXpsBurned,
            uint256 _totalBugBountyPaid,
            uint256 _activeCampaigns
        )
    {
        uint256 activeCampaigns = 0;
        for (uint256 i = 1; i < nextCampaignId; i++) {
            if (marketingCampaigns[i].active && block.timestamp <= marketingCampaigns[i].endTime) {
                activeCampaigns++;
            }
        }
        
        return (totalXpsBurned, totalBugBountyPaid, activeCampaigns);
    }
    
    /**
     * @dev Update wallet addresses
     */
    function updateWallets(
        address _teamWallet,
        address _developmentWallet,
        address _marketingWallet,
        address _bugBountyWallet,
        address _reserveWallet
    ) external onlyOwner {
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_developmentWallet != address(0), "Invalid development wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_bugBountyWallet != address(0), "Invalid bug bounty wallet");
        require(_reserveWallet != address(0), "Invalid reserve wallet");
        
        teamWallet = _teamWallet;
        developmentWallet = _developmentWallet;
        marketingWallet = _marketingWallet;
        bugBountyWallet = _bugBountyWallet;
        reserveWallet = _reserveWallet;
    }
    
    /**
     * @dev Withdraw stuck tokens (emergency)
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token");
        IERC20(token).safeTransfer(owner(), amount);
    }
}