// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XpSwap DEX Main Router
 * @dev Core DEX contract for token swapping and liquidity management
 */
contract XpSwapDEX is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    // Pool structure
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feeRate; // in basis points
        bool active;
    }
    
    mapping(bytes32 => Pool) public pools;
    bytes32[] public poolIds;
    
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant MAX_FEE_RATE = 1000; // 10%
    
    event PoolCreated(bytes32 indexed poolId, address indexed tokenA, address indexed tokenB);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, bytes32 indexed poolId, uint256 amountA, uint256 amountB, uint256 liquidity);
    
    constructor() Ownable(msg.sender) {}
    
    function createPool(address tokenA, address tokenB, uint256 feeRate) external onlyOwner returns (bytes32 poolId) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feeRate <= MAX_FEE_RATE, "Fee rate too high");
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        poolId = keccak256(abi.encodePacked(token0, token1));
        
        require(pools[poolId].tokenA == address(0), "Pool exists");
        
        pools[poolId] = Pool({
            tokenA: token0,
            tokenB: token1,
            reserveA: 0,
            reserveB: 0,
            totalLiquidity: 0,
            feeRate: feeRate,
            active: true
        });
        
        poolIds.push(poolId);
        emit PoolCreated(poolId, token0, token1);
    }
    
    function getPoolCount() external view returns (uint256) {
        return poolIds.length;
    }
}
