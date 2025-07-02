// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title XpSwapAdvancedAMM
 * @dev Advanced Automated Market Maker with MEV protection and enhanced features
 * Implements sophisticated algorithms for better price discovery and user protection
 */
contract XpSwapAdvancedAMM is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using Math for uint256;
    
    // Pool structure with advanced features
    struct AdvancedPool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feeRate; // Base fee rate in basis points
        uint256 dynamicFeeRate; // Dynamic fee based on volatility
        uint256 lastPriceA; // Price oracle for token A
        uint256 lastPriceB; // Price oracle for token B
        uint256 lastUpdateTime;
        uint256 cumulativePriceA;
        uint256 cumulativePriceB;
        uint256 volumeWindow; // 24h trading volume
        uint256 volatilityIndex; // Volatility measurement
        bool active;
    }
    
    // Enhanced user liquidity tracking
    struct AdvancedUserLiquidity {
        uint256 amount;
        uint256 rewardDebt;
        uint256 entryTime;
        uint256 lockPeriod;
        bool autoCompound;
    }
    
    // MEV Protection structures
    struct MEVProtection {
        uint256 lastTxBlock;
        uint256 txCountInBlock;
        uint256 lastTxTimestamp;
        uint256 cumulativeGasUsed;
        bool flagged;
    }
    
    // Price impact tracking
    struct PriceImpactData {
        uint256 priceImpact;
        uint256 timestamp;
        address user;
        bool suspicious;
    }
    
    // State variables
    mapping(bytes32 => AdvancedPool) public advancedPools;
    mapping(bytes32 => mapping(address => AdvancedUserLiquidity)) public advancedUserLiquidity;
    mapping(address => MEVProtection) public mevProtection;
    mapping(bytes32 => PriceImpactData[]) public priceImpactHistory;
    
    bytes32[] public advancedPoolIds;
    
    // Configuration parameters
    uint256 public constant MAX_PRICE_IMPACT = 500; // 5% max price impact
    uint256 public constant MEV_PROTECTION_BLOCKS = 2; // Minimum blocks between large trades
    uint256 public constant MAX_TXS_PER_BLOCK = 3; // Maximum transactions per block per user
    uint256 public constant VOLATILITY_WINDOW = 24 hours; // Volatility calculation window
    uint256 public constant DYNAMIC_FEE_MULTIPLIER = 2; // Max dynamic fee multiplier
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PRICE_PRECISION = 1e18;
    
    // Fee configuration
    uint256 public protocolFeeRate = 10; // 0.1% protocol fee
    uint256 public liquidityProviderFeeRate = 25; // 0.25% LP fee
    uint256 public maxDynamicFeeRate = 100; // 1% max dynamic fee
    
    // MEV protection parameters
    uint256 public mevProtectionThreshold = 10 ether; // Threshold for MEV protection activation
    uint256 public gasLimitPerTx = 500000; // Gas limit per transaction
    
    address public feeRecipient;
    address public emergencyAdmin;
    
    // Events
    event AdvancedPoolCreated(
        bytes32 indexed poolId,
        address indexed tokenA,
        address indexed tokenB,
        uint256 feeRate
    );
    
    event AdvancedSwap(
        bytes32 indexed poolId,
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        uint256 priceImpact,
        uint256 dynamicFee
    );
    
    event MEVDetected(
        address indexed user,
        bytes32 indexed poolId,
        uint256 blockNumber,
        string reason
    );
    
    event DynamicFeeUpdated(
        bytes32 indexed poolId,
        uint256 oldFeeRate,
        uint256 newFeeRate,
        uint256 volatilityIndex
    );
    
    event PriceOracleUpdated(
        bytes32 indexed poolId,
        uint256 priceA,
        uint256 priceB,
        uint256 timestamp
    );
    
    modifier antiMEV(bytes32 poolId, uint256 amountIn) {
        _checkMEVProtection(poolId, amountIn);
        _;
        _updateMEVProtection();
    }
    
    modifier validPool(bytes32 poolId) {
        require(advancedPools[poolId].active, "Pool inactive");
        _;
    }
    
    constructor(address _feeRecipient, address _emergencyAdmin) {
        feeRecipient = _feeRecipient;
        emergencyAdmin = _emergencyAdmin;
    }
    
    /**
     * @dev Create an advanced pool with dynamic pricing features
     */
    function createAdvancedPool(
        address tokenA,
        address tokenB,
        uint256 baseFeeRate,
        uint256 initialPriceA,
        uint256 initialPriceB
    ) external onlyOwner returns (bytes32 poolId) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(baseFeeRate <= 1000, "Fee rate too high"); // Max 10%
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        poolId = keccak256(abi.encodePacked(token0, token1, block.timestamp));
        
        require(advancedPools[poolId].tokenA == address(0), "Pool exists");
        
        advancedPools[poolId] = AdvancedPool({
            tokenA: token0,
            tokenB: token1,
            reserveA: 0,
            reserveB: 0,
            totalLiquidity: 0,
            feeRate: baseFeeRate,
            dynamicFeeRate: baseFeeRate,
            lastPriceA: initialPriceA,
            lastPriceB: initialPriceB,
            lastUpdateTime: block.timestamp,
            cumulativePriceA: 0,
            cumulativePriceB: 0,
            volumeWindow: 0,
            volatilityIndex: 0,
            active: true
        });
        
        advancedPoolIds.push(poolId);
        
        emit AdvancedPoolCreated(poolId, token0, token1, baseFeeRate);
    }
    
    /**
     * @dev Advanced swap with MEV protection and dynamic pricing
     */
    function swapWithProtection(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 deadline
    ) external 
        nonReentrant 
        validPool(poolId) 
        antiMEV(poolId, amountIn) 
        returns (uint256 amountOut) 
    {
        require(block.timestamp <= deadline, "Transaction expired");
        require(amountIn > 0, "Invalid input amount");
        require(to != address(0), "Invalid recipient");
        
        AdvancedPool storage pool = advancedPools[poolId];
        
        // Validate token
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        address tokenOut = tokenIn == pool.tokenA ? pool.tokenB : pool.tokenA;
        
        // Calculate output amount with dynamic pricing
        (amountOut, uint256 priceImpact, uint256 dynamicFee) = _calculateAdvancedSwap(
            pool,
            tokenIn,
            amountIn
        );
        
        require(amountOut >= amountOutMin, "Insufficient output");
        require(priceImpact <= MAX_PRICE_IMPACT, "Price impact too high");
        
        // Update dynamic fee based on volatility
        _updateDynamicFee(poolId, priceImpact);
        
        // Execute swap
        _executeAdvancedSwap(pool, tokenIn, tokenOut, amountIn, amountOut, dynamicFee);
        
        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);
        
        // Update price oracle
        _updatePriceOracle(poolId);
        
        // Record price impact
        _recordPriceImpact(poolId, priceImpact);
        
        emit AdvancedSwap(
            poolId,
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            dynamicFee,
            priceImpact,
            pool.dynamicFeeRate
        );
    }
    
    /**
     * @dev Get advanced swap quote with price impact analysis
     */
    function getAdvancedQuote(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn
    ) external view validPool(poolId) returns (
        uint256 amountOut,
        uint256 priceImpact,
        uint256 dynamicFee,
        uint256 minimumAmountOut,
        bool mevRisk
    ) {
        AdvancedPool memory pool = advancedPools[poolId];
        
        (amountOut, priceImpact, dynamicFee) = _calculateAdvancedSwap(
            pool,
            tokenIn,
            amountIn
        );
        
        // Calculate minimum output with slippage protection
        minimumAmountOut = amountOut * 995 / 1000; // 0.5% slippage tolerance
        
        // Check MEV risk
        mevRisk = _assessMEVRisk(poolId, amountIn);
    }
    
    /**
     * @dev Add liquidity with time-locked rewards
     */
    function addAdvancedLiquidity(
        bytes32 poolId,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        uint256 lockPeriod,
        bool autoCompound
    ) external nonReentrant validPool(poolId) returns (
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    ) {
        AdvancedPool storage pool = advancedPools[poolId];
        
        // Calculate optimal amounts
        (amountA, amountB) = _calculateOptimalAmounts(
            pool,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        
        // Mint liquidity tokens
        liquidity = _mintAdvancedLiquidity(poolId, amountA, amountB);
        
        // Update user liquidity with advanced features
        AdvancedUserLiquidity storage userLiq = advancedUserLiquidity[poolId][msg.sender];
        userLiq.amount += liquidity;
        userLiq.entryTime = block.timestamp;
        userLiq.lockPeriod = lockPeriod;
        userLiq.autoCompound = autoCompound;
        
        // Transfer tokens
        IERC20(pool.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        
        // Update reserves
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        
        // Update price oracle
        _updatePriceOracle(poolId);
    }
    
    /**
     * @dev Calculate volatility-based dynamic fee
     */
    function calculateDynamicFee(bytes32 poolId) public view returns (uint256) {
        AdvancedPool memory pool = advancedPools[poolId];
        
        // Base fee rate
        uint256 baseFee = pool.feeRate;
        
        // Volatility multiplier (0.5x to 2x based on volatility)
        uint256 volatilityMultiplier = BASIS_POINTS + 
            (pool.volatilityIndex * DYNAMIC_FEE_MULTIPLIER * BASIS_POINTS) / 100;
        
        uint256 dynamicFee = (baseFee * volatilityMultiplier) / BASIS_POINTS;
        
        // Cap at maximum dynamic fee
        return Math.min(dynamicFee, maxDynamicFeeRate);
    }
    
    /**
     * @dev Get pool analytics
     */
    function getPoolAnalytics(bytes32 poolId) external view returns (
        uint256 tvl,
        uint256 volume24h,
        uint256 volatility,
        uint256 currentFeeRate,
        uint256 priceImpactScore,
        uint256 liquidityUtilization
    ) {
        AdvancedPool memory pool = advancedPools[poolId];
        
        tvl = pool.reserveA + pool.reserveB; // Simplified TVL
        volume24h = pool.volumeWindow;
        volatility = pool.volatilityIndex;
        currentFeeRate = pool.dynamicFeeRate;
        
        // Calculate average price impact over last 24h
        PriceImpactData[] memory impacts = priceImpactHistory[poolId];
        uint256 totalImpact = 0;
        uint256 validImpacts = 0;
        
        for (uint256 i = impacts.length; i > 0 && i > impacts.length - 100; i--) {
            if (block.timestamp - impacts[i-1].timestamp <= 24 hours) {
                totalImpact += impacts[i-1].priceImpact;
                validImpacts++;
            }
        }
        
        priceImpactScore = validImpacts > 0 ? totalImpact / validImpacts : 0;
        liquidityUtilization = (volume24h * BASIS_POINTS) / (pool.reserveA + pool.reserveB);
    }
    
    // Internal functions
    
    function _calculateAdvancedSwap(
        AdvancedPool memory pool,
        address tokenIn,
        uint256 amountIn
    ) internal view returns (uint256 amountOut, uint256 priceImpact, uint256 dynamicFee) {
        uint256 reserveIn = tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA;
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        // Calculate dynamic fee
        dynamicFee = calculateDynamicFee(keccak256(abi.encodePacked(pool.tokenA, pool.tokenB)));
        
        // Calculate output with dynamic fee
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - dynamicFee) / BASIS_POINTS;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        
        // Calculate price impact
        priceImpact = (amountOut * BASIS_POINTS) / reserveOut;
    }
    
    function _checkMEVProtection(bytes32 poolId, uint256 amountIn) internal view {
        MEVProtection memory protection = mevProtection[msg.sender];
        
        // Check if amount exceeds MEV threshold
        if (amountIn >= mevProtectionThreshold) {
            require(
                block.number > protection.lastTxBlock + MEV_PROTECTION_BLOCKS,
                "MEV protection: large trade too frequent"
            );
        }
        
        // Check transaction frequency
        if (block.number == protection.lastTxBlock) {
            require(
                protection.txCountInBlock < MAX_TXS_PER_BLOCK,
                "MEV protection: too many transactions in block"
            );
        }
        
        // Check for sandwich attack patterns
        require(!protection.flagged, "MEV protection: address flagged");
    }
    
    function _updateMEVProtection() internal {
        MEVProtection storage protection = mevProtection[msg.sender];
        
        if (block.number > protection.lastTxBlock) {
            protection.txCountInBlock = 1;
        } else {
            protection.txCountInBlock++;
        }
        
        protection.lastTxBlock = block.number;
        protection.lastTxTimestamp = block.timestamp;
        protection.cumulativeGasUsed += gasleft();
    }
    
    function _updateDynamicFee(bytes32 poolId, uint256 priceImpact) internal {
        AdvancedPool storage pool = advancedPools[poolId];
        
        // Update volatility index based on price impact
        uint256 newVolatility = (pool.volatilityIndex * 9 + priceImpact) / 10; // EMA
        pool.volatilityIndex = newVolatility;
        
        // Update dynamic fee rate
        uint256 oldFeeRate = pool.dynamicFeeRate;
        pool.dynamicFeeRate = calculateDynamicFee(poolId);
        
        if (oldFeeRate != pool.dynamicFeeRate) {
            emit DynamicFeeUpdated(poolId, oldFeeRate, pool.dynamicFeeRate, newVolatility);
        }
    }
    
    function _updatePriceOracle(bytes32 poolId) internal {
        AdvancedPool storage pool = advancedPools[poolId];
        
        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        if (timeElapsed > 0) {
            uint256 priceA = (pool.reserveB * PRICE_PRECISION) / pool.reserveA;
            uint256 priceB = (pool.reserveA * PRICE_PRECISION) / pool.reserveB;
            
            pool.cumulativePriceA += priceA * timeElapsed;
            pool.cumulativePriceB += priceB * timeElapsed;
            
            pool.lastPriceA = priceA;
            pool.lastPriceB = priceB;
            pool.lastUpdateTime = block.timestamp;
            
            emit PriceOracleUpdated(poolId, priceA, priceB, block.timestamp);
        }
    }
    
    function _recordPriceImpact(bytes32 poolId, uint256 priceImpact) internal {
        priceImpactHistory[poolId].push(PriceImpactData({
            priceImpact: priceImpact,
            timestamp: block.timestamp,
            user: msg.sender,
            suspicious: priceImpact > MAX_PRICE_IMPACT / 2 // Flag high impact trades
        }));
    }
    
    function _assessMEVRisk(bytes32 poolId, uint256 amountIn) internal view returns (bool) {
        MEVProtection memory protection = mevProtection[msg.sender];
        
        // High risk if large amount and recent activity
        if (amountIn >= mevProtectionThreshold && 
            block.number <= protection.lastTxBlock + MEV_PROTECTION_BLOCKS) {
            return true;
        }
        
        // High risk if too many transactions recently
        if (protection.txCountInBlock >= MAX_TXS_PER_BLOCK) {
            return true;
        }
        
        return false;
    }
    
    function _executeAdvancedSwap(
        AdvancedPool storage pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    ) internal {
        // Update reserves
        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        // Update 24h volume
        pool.volumeWindow += amountIn; // Simplified volume tracking
        
        // Distribute fees
        if (fee > 0) {
            uint256 protocolFee = (fee * protocolFeeRate) / BASIS_POINTS;
            IERC20(tokenIn).safeTransfer(feeRecipient, protocolFee);
        }
    }
    
    function _calculateOptimalAmounts(
        AdvancedPool memory pool,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal pure returns (uint256 amountA, uint256 amountB) {
        if (pool.reserveA == 0 && pool.reserveB == 0) {
            return (amountADesired, amountBDesired);
        }
        
        uint256 amountBOptimal = (amountADesired * pool.reserveB) / pool.reserveA;
        if (amountBOptimal <= amountBDesired) {
            require(amountBOptimal >= amountBMin, "Insufficient B amount");
            return (amountADesired, amountBOptimal);
        } else {
            uint256 amountAOptimal = (amountBDesired * pool.reserveA) / pool.reserveB;
            require(amountAOptimal <= amountADesired && amountAOptimal >= amountAMin, "Insufficient A amount");
            return (amountAOptimal, amountBDesired);
        }
    }
    
    function _mintAdvancedLiquidity(
        bytes32 poolId,
        uint256 amountA,
        uint256 amountB
    ) internal returns (uint256 liquidity) {
        AdvancedPool storage pool = advancedPools[poolId];
        
        if (pool.totalLiquidity == 0) {
            liquidity = Math.sqrt(amountA * amountB);
        } else {
            liquidity = Math.min(
                (amountA * pool.totalLiquidity) / pool.reserveA,
                (amountB * pool.totalLiquidity) / pool.reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        pool.totalLiquidity += liquidity;
    }
    
    // Admin functions
    
    function setMEVProtectionThreshold(uint256 _threshold) external onlyOwner {
        mevProtectionThreshold = _threshold;
    }
    
    function setMaxDynamicFeeRate(uint256 _maxFeeRate) external onlyOwner {
        require(_maxFeeRate <= 1000, "Fee rate too high");
        maxDynamicFeeRate = _maxFeeRate;
    }
    
    function flagMEVBot(address user) external onlyOwner {
        mevProtection[user].flagged = true;
        emit MEVDetected(user, bytes32(0), block.number, "Manually flagged");
    }
    
    function unflagUser(address user) external onlyOwner {
        mevProtection[user].flagged = false;
    }
    
    function emergencyPause(bytes32 poolId) external {
        require(msg.sender == owner() || msg.sender == emergencyAdmin, "Not authorized");
        advancedPools[poolId].active = false;
    }
    
    function emergencyUnpause(bytes32 poolId) external onlyOwner {
        advancedPools[poolId].active = true;
    }
}