// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XpSwapLPToken
 * @dev ERC20 token representing liquidity provider shares in XpSwap pools
 */
contract XpSwapLPToken is ERC20, Ownable, ReentrancyGuard {
    // Trading pair information
    address public immutable tokenA;
    address public immutable tokenB;
    address public immutable pairAddress;
    
    // Pool reserves
    uint256 public reserveA;
    uint256 public reserveB;
    
    // XPS reward tracking
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public accumulatedRewards;
    
    // Events
    event LiquidityMinted(address indexed to, uint256 amount);
    event LiquidityBurned(address indexed from, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ReservesUpdated(uint256 reserveA, uint256 reserveB);
    
    constructor(
        string memory name,
        string memory symbol,
        address _tokenA,
        address _tokenB,
        address _pairAddress
    ) ERC20(name, symbol) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        pairAddress = _pairAddress;
    }
    
    /**
     * @dev Mint LP tokens to liquidity provider
     * @param to Address to mint tokens to
     * @param amount Amount of LP tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit LiquidityMinted(to, amount);
    }
    
    /**
     * @dev Burn LP tokens from liquidity provider
     * @param from Address to burn tokens from
     * @param amount Amount of LP tokens to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit LiquidityBurned(from, amount);
    }
    
    /**
     * @dev Update pool reserves
     * @param _reserveA New reserve amount for token A
     * @param _reserveB New reserve amount for token B
     */
    function updateReserves(uint256 _reserveA, uint256 _reserveB) external onlyOwner {
        reserveA = _reserveA;
        reserveB = _reserveB;
        emit ReservesUpdated(_reserveA, _reserveB);
    }
    
    /**
     * @dev Calculate LP token share of pool
     * @param lpAmount Amount of LP tokens
     * @return amountA Amount of token A
     * @return amountB Amount of token B
     */
    function calculateShare(uint256 lpAmount) external view returns (uint256 amountA, uint256 amountB) {
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return (0, 0);
        }
        
        amountA = (lpAmount * reserveA) / totalSupply;
        amountB = (lpAmount * reserveB) / totalSupply;
    }
    
    /**
     * @dev Calculate XPS rewards for LP token holder
     * @param holder Address of LP token holder
     * @return rewardAmount Amount of XPS rewards
     */
    function calculateRewards(address holder) external view returns (uint256 rewardAmount) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) {
            return 0;
        }
        
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        
        // Calculate rewards based on LP token share and time held
        uint256 timeSinceLastClaim = block.timestamp - lastRewardClaim[holder];
        uint256 sharePercentage = (balance * 1e18) / totalSupply;
        
        // Base reward rate: 0.1% per day (adjustable)
        uint256 dailyRewardRate = 1e15; // 0.1% in wei
        rewardAmount = (sharePercentage * dailyRewardRate * timeSinceLastClaim) / (1e18 * 86400);
        
        return rewardAmount + accumulatedRewards[holder];
    }
    
    /**
     * @dev Update reward claim timestamp
     * @param holder Address of LP token holder
     * @param amount Amount of rewards claimed
     */
    function updateRewardClaim(address holder, uint256 amount) external onlyOwner {
        lastRewardClaim[holder] = block.timestamp;
        accumulatedRewards[holder] = 0;
        emit RewardsClaimed(holder, amount);
    }
    
    /**
     * @dev Override transfer to update reward accumulation
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Update accumulated rewards before transfer
        if (from != address(0)) {
            uint256 rewards = this.calculateRewards(from);
            accumulatedRewards[from] = rewards;
            lastRewardClaim[from] = block.timestamp;
        }
        
        if (to != address(0)) {
            lastRewardClaim[to] = block.timestamp;
        }
    }
}