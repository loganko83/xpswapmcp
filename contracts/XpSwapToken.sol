// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XpSwap Token (XPS)
 * @dev Native token for XpSwap DEX with deflationary mechanisms
 * Features:
 * - Deflationary tokenomics through burning
 * - Staking rewards
 * - LP mining rewards
 * - Fee discounts for holders
 * - Governance capabilities
 * - Bug bounty and marketing allocations
 */
contract XpSwapToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {
    // Maximum total supply: 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation percentages (basis points, 10000 = 100%)
    uint256 public constant TEAM_ALLOCATION = 1500;        // 15% for team
    uint256 public constant DEVELOPMENT_ALLOCATION = 1000;  // 10% for development
    uint256 public constant MARKETING_ALLOCATION = 500;     // 5% for marketing
    uint256 public constant BUG_BOUNTY_ALLOCATION = 200;    // 2% for bug bounty
    uint256 public constant LIQUIDITY_MINING = 4000;       // 40% for liquidity mining
    uint256 public constant STAKING_REWARDS = 2000;        // 20% for staking rewards
    uint256 public constant RESERVE_ALLOCATION = 800;      // 8% for reserves
    
    // Addresses for allocations
    address public teamWallet;
    address public developmentWallet;
    address public marketingWallet;
    address public bugBountyWallet;
    address public stakingContract;
    address public liquidityMiningContract;
    address public reserveWallet;
    
    // Fee discount structure (basis points)
    uint256 public constant BASE_FEE = 30; // 0.3%
    mapping(uint256 => uint256) public feeDiscountTiers; // XPS amount => discount percentage
    
    // Burn tracker
    uint256 public totalBurned;
    
    // Minting limits per category
    mapping(string => uint256) public categoryMinted;
    mapping(string => uint256) public categoryLimit;
    
    // Events
    event TokensBurned(uint256 amount, string reason);
    event FeeDiscountApplied(address user, uint256 xpsBalance, uint256 discountPercent);
    event AllocationMinted(string category, address recipient, uint256 amount);
    
    constructor(
        address _teamWallet,
        address _developmentWallet,
        address _marketingWallet,
        address _bugBountyWallet
    ) ERC20("XpSwap Token", "XPS") {
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_developmentWallet != address(0), "Invalid development wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_bugBountyWallet != address(0), "Invalid bug bounty wallet");
        
        teamWallet = _teamWallet;
        developmentWallet = _developmentWallet;
        marketingWallet = _marketingWallet;
        bugBountyWallet = _bugBountyWallet;
        reserveWallet = owner();
        
        // Set category limits
        categoryLimit["team"] = (MAX_SUPPLY * TEAM_ALLOCATION) / 10000;
        categoryLimit["development"] = (MAX_SUPPLY * DEVELOPMENT_ALLOCATION) / 10000;
        categoryLimit["marketing"] = (MAX_SUPPLY * MARKETING_ALLOCATION) / 10000;
        categoryLimit["bugBounty"] = (MAX_SUPPLY * BUG_BOUNTY_ALLOCATION) / 10000;
        categoryLimit["liquidityMining"] = (MAX_SUPPLY * LIQUIDITY_MINING) / 10000;
        categoryLimit["stakingRewards"] = (MAX_SUPPLY * STAKING_REWARDS) / 10000;
        categoryLimit["reserve"] = (MAX_SUPPLY * RESERVE_ALLOCATION) / 10000;
        
        // Setup fee discount tiers
        feeDiscountTiers[1000 * 10**18] = 10;   // 1k XPS = 10% discount
        feeDiscountTiers[5000 * 10**18] = 20;   // 5k XPS = 20% discount
        feeDiscountTiers[10000 * 10**18] = 30;  // 10k XPS = 30% discount
        feeDiscountTiers[50000 * 10**18] = 50;  // 50k XPS = 50% discount
        feeDiscountTiers[100000 * 10**18] = 75; // 100k XPS = 75% discount
        
        // Initial mint for team (vested)
        _mintToCategory("team", teamWallet, categoryLimit["team"]);
    }
    
    /**
     * @dev Mint tokens for specific category with limits
     */
    function mintToCategory(
        string memory category,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        _mintToCategory(category, recipient, amount);
    }
    
    function _mintToCategory(
        string memory category,
        address recipient,
        uint256 amount
    ) internal {
        require(recipient != address(0), "Invalid recipient");
        require(
            categoryMinted[category] + amount <= categoryLimit[category],
            "Exceeds category allocation"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        categoryMinted[category] += amount;
        _mint(recipient, amount);
        
        emit AllocationMinted(category, recipient, amount);
    }
    
    /**
     * @dev Set contract addresses for staking and liquidity mining
     */
    function setContracts(
        address _stakingContract,
        address _liquidityMiningContract
    ) external onlyOwner {
        stakingContract = _stakingContract;
        liquidityMiningContract = _liquidityMiningContract;
    }
    
    /**
     * @dev Mint rewards for staking
     */
    function mintStakingRewards(address recipient, uint256 amount) 
        external 
        onlyAuthorized 
    {
        _mintToCategory("stakingRewards", recipient, amount);
    }
    
    /**
     * @dev Mint rewards for liquidity mining
     */
    function mintLiquidityRewards(address recipient, uint256 amount) 
        external 
        onlyAuthorized 
    {
        _mintToCategory("liquidityMining", recipient, amount);
    }
    
    /**
     * @dev Calculate fee discount based on XPS balance
     */
    function calculateFeeDiscount(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        uint256 discount = 0;
        
        // Find highest applicable tier
        if (balance >= 100000 * 10**18) {
            discount = feeDiscountTiers[100000 * 10**18];
        } else if (balance >= 50000 * 10**18) {
            discount = feeDiscountTiers[50000 * 10**18];
        } else if (balance >= 10000 * 10**18) {
            discount = feeDiscountTiers[10000 * 10**18];
        } else if (balance >= 5000 * 10**18) {
            discount = feeDiscountTiers[5000 * 10**18];
        } else if (balance >= 1000 * 10**18) {
            discount = feeDiscountTiers[1000 * 10**18];
        }
        
        return discount;
    }
    
    /**
     * @dev Calculate effective fee after XPS discount
     */
    function getEffectiveFee(address user) external view returns (uint256) {
        uint256 discount = this.calculateFeeDiscount(user);
        uint256 effectiveFee = BASE_FEE - ((BASE_FEE * discount) / 100);
        return effectiveFee;
    }
    
    /**
     * @dev Burn tokens from protocol revenue
     */
    function burnFromRevenue(uint256 amount, string memory reason) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        
        _burn(address(this), amount);
        totalBurned += amount;
        
        emit TokensBurned(amount, reason);
    }
    
    /**
     * @dev Emergency burn function for deflation
     */
    function emergencyBurn(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() >= amount, "Insufficient total supply");
        
        _burn(address(this), amount);
        totalBurned += amount;
        
        emit TokensBurned(amount, "Emergency deflation");
    }
    
    /**
     * @dev Get circulating supply (total supply - burned)
     */
    function getCirculatingSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @dev Get burn rate (percentage of max supply burned)
     */
    function getBurnRate() external view returns (uint256) {
        return (totalBurned * 10000) / MAX_SUPPLY; // Return in basis points
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Modifier for authorized contracts only
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == stakingContract || 
            msg.sender == liquidityMiningContract || 
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    /**
     * @dev Update fee discount tier
     */
    function updateFeeDiscountTier(uint256 xpsAmount, uint256 discountPercent) 
        external 
        onlyOwner 
    {
        require(discountPercent <= 100, "Discount cannot exceed 100%");
        feeDiscountTiers[xpsAmount] = discountPercent;
    }
    
    /**
     * @dev Withdraw accidentally sent tokens
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot withdraw XPS");
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev Get allocation information
     */
    function getAllocationInfo(string memory category) 
        external 
        view 
        returns (uint256 limit, uint256 minted, uint256 remaining) 
    {
        limit = categoryLimit[category];
        minted = categoryMinted[category];
        remaining = limit - minted;
    }
}