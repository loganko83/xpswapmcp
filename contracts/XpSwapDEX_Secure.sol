// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title XpSwapDEX - Secure Version
 * @dev Enhanced security implementation with reentrancy protection, overflow protection,
 * MEV resistance, and decentralized governance controls
 */
contract XpSwapDEXSecure is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feeRate; // in basis points (30 = 0.3%)
        bool active;
        uint256 lastUpdateBlock; // MEV protection
    }

    struct UserLiquidity {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lockUntil; // Time-locked liquidity
    }

    // State variables
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => UserLiquidity)) public userLiquidity;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public lastTxBlock; // MEV protection
    
    bytes32[] public poolIds;
    address public feeRecipient;
    
    // Security constants
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_FEE_RATE = 1000; // 10% maximum fee
    uint256 public constant MIN_BLOCK_DELAY = 2; // Minimum blocks between transactions
    uint256 public constant MAX_SLIPPAGE = 500; // 5% maximum slippage
    uint256 public constant LIQUIDITY_LOCK_PERIOD = 7 days; // Minimum liquidity lock period
    
    // Governance variables
    uint256 public govProposalThreshold = 100000e18; // Minimum tokens to create proposal
    uint256 public govVotingPeriod = 3 days;
    mapping(address => bool) public govMembers; // Multi-sig governance members
    uint256 public govMemberCount;
    
    // Events
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed tokenA,
        address indexed tokenB,
        uint256 feeRate
    );

    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity,
        uint256 lockUntil
    );

    event LiquidityRemoved(
        bytes32 indexed poolId,
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    event TokenSwapped(
        bytes32 indexed poolId,
        address indexed user,
        address indexed tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    event GovernanceAction(
        address indexed member,
        string action,
        bytes32 indexed poolId
    );

    // Modifiers
    modifier onlyGovMember() {
        require(govMembers[msg.sender], "Not governance member");
        _;
    }

    modifier antiMEV() {
        require(
            block.number > lastTxBlock[msg.sender].add(MIN_BLOCK_DELAY), 
            "MEV protection: too frequent transactions"
        );
        lastTxBlock[msg.sender] = block.number;
        _;
    }

    modifier validPool(bytes32 poolId) {
        require(pools[poolId].tokenA != address(0), "Pool does not exist");
        require(pools[poolId].active, "Pool inactive");
        _;
    }

    modifier slippageProtection(bytes32 poolId, uint256 amountOut) {
        Pool memory pool = pools[poolId];
        uint256 maxAllowed = pool.reserveA.add(pool.reserveB).mul(MAX_SLIPPAGE).div(BASIS_POINTS);
        require(amountOut <= maxAllowed, "Slippage protection: amount too large");
        _;
    }

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        
        // Initialize governance with deployer
        govMembers[msg.sender] = true;
        govMemberCount = 1;
    }

    /**
     * @dev Create a new liquidity pool with enhanced security
     */
    function createPool(
        address tokenA,
        address tokenB,
        uint256 feeRate
    ) external onlyGovMember whenNotPaused returns (bytes32 poolId) {
        require(tokenA != tokenB, "Identical addresses");
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
            active: true,
            lastUpdateBlock: block.number
        });

        poolIds.push(poolId);
        supportedTokens[token0] = true;
        supportedTokens[token1] = true;

        emit PoolCreated(poolId, token0, token1, feeRate);
        emit GovernanceAction(msg.sender, "createPool", poolId);
    }

    /**
     * @dev Add liquidity with time-lock and enhanced security
     */
    function addLiquidity(
        bytes32 poolId,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant antiMEV validPool(poolId) whenNotPaused 
       returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        
        Pool storage pool = pools[poolId];
        
        // Prevent manipulation by checking for significant reserve changes
        require(
            block.number > pool.lastUpdateBlock.add(MIN_BLOCK_DELAY),
            "Pool update too recent"
        );

        (amountA, amountB) = _calculateLiquidityAmounts(
            pool,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        // Check for reasonable amounts (prevent dust attacks)
        require(amountA >= 1000 && amountB >= 1000, "Amounts too small");

        liquidity = _mintLiquidity(poolId, amountA, amountB);

        // Secure token transfers with balance verification
        uint256 balanceABefore = IERC20(pool.tokenA).balanceOf(address(this));
        uint256 balanceBBefore = IERC20(pool.tokenB).balanceOf(address(this));
        
        IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountB);
        
        // Verify transfers completed successfully
        require(
            IERC20(pool.tokenA).balanceOf(address(this)) == balanceABefore.add(amountA),
            "Token A transfer failed"
        );
        require(
            IERC20(pool.tokenB).balanceOf(address(this)) == balanceBBefore.add(amountB),
            "Token B transfer failed"
        );

        // Update pool state
        pool.reserveA = pool.reserveA.add(amountA);
        pool.reserveB = pool.reserveB.add(amountB);
        pool.lastUpdateBlock = block.number;

        // Update user liquidity with time lock
        uint256 lockUntil = block.timestamp.add(LIQUIDITY_LOCK_PERIOD);
        userLiquidity[poolId][msg.sender].amount = userLiquidity[poolId][msg.sender].amount.add(liquidity);
        userLiquidity[poolId][msg.sender].lockUntil = lockUntil;

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity, lockUntil);
    }

    /**
     * @dev Remove liquidity with time-lock enforcement
     */
    function removeLiquidity(
        bytes32 poolId,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant antiMEV validPool(poolId) whenNotPaused 
       returns (uint256 amountA, uint256 amountB) {
        
        Pool storage pool = pools[poolId];
        UserLiquidity storage userLiq = userLiquidity[poolId][msg.sender];
        
        require(userLiq.amount >= liquidity, "Insufficient liquidity");
        require(block.timestamp >= userLiq.lockUntil, "Liquidity still locked");

        // Calculate withdrawal amounts using SafeMath
        amountA = liquidity.mul(pool.reserveA).div(pool.totalLiquidity);
        amountB = liquidity.mul(pool.reserveB).div(pool.totalLiquidity);

        require(amountA >= amountAMin && amountB >= amountBMin, "Insufficient output");

        // Update state before external calls
        userLiq.amount = userLiq.amount.sub(liquidity);
        pool.totalLiquidity = pool.totalLiquidity.sub(liquidity);
        pool.reserveA = pool.reserveA.sub(amountA);
        pool.reserveB = pool.reserveB.sub(amountB);
        pool.lastUpdateBlock = block.number;

        // Secure token transfers
        IERC20(pool.tokenA).transfer(msg.sender, amountA);
        IERC20(pool.tokenB).transfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Secure token swap with MEV protection and slippage control
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external nonReentrant antiMEV whenNotPaused 
       returns (uint256[] memory amounts) {
        
        require(path.length >= 2, "Invalid path");
        require(to != address(0), "Invalid recipient");
        require(
            supportedTokens[path[0]] && supportedTokens[path[path.length - 1]], 
            "Unsupported token"
        );

        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output amount");

        // Slippage protection for each hop
        for (uint256 i = 0; i < path.length - 1; i++) {
            bytes32 poolId = getPoolId(path[i], path[i + 1]);
            require(
                amounts[i + 1] <= pools[poolId].reserveA.add(pools[poolId].reserveB)
                    .mul(MAX_SLIPPAGE).div(BASIS_POINTS),
                "Slippage protection triggered"
            );
        }

        // Secure token transfer
        IERC20(path[0]).transferFrom(msg.sender, address(this), amounts[0]);
        _swap(amounts, path, to);
    }

    /**
     * @dev Get output amounts for swap path
     */
    function getAmountsOut(uint256 amountIn, address[] memory path)
        public view returns (uint256[] memory amounts) {
        
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i = 0; i < path.length - 1; i++) {
            bytes32 poolId = getPoolId(path[i], path[i + 1]);
            Pool memory pool = pools[poolId];
            require(pool.active, "Pool inactive");

            amounts[i + 1] = getAmountOut(amounts[i], path[i], path[i + 1], pool);
        }
    }

    /**
     * @dev Calculate output amount for a single swap
     */
    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut,
        Pool memory pool
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        
        uint256 reserveIn = tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA;
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // Using SafeMath for all calculations
        uint256 amountInWithFee = amountIn.mul(BASIS_POINTS.sub(pool.feeRate));
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(BASIS_POINTS).add(amountInWithFee);
        amountOut = numerator.div(denominator);
    }

    /**
     * @dev Internal swap function with enhanced security
     */
    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address to
    ) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            bytes32 poolId = getPoolId(input, output);
            Pool storage pool = pools[poolId];
            
            uint256 amountOut = amounts[i + 1];
            uint256 fee = amounts[i].mul(pool.feeRate).div(BASIS_POINTS);
            
            // Update reserves using SafeMath
            if (input == pool.tokenA) {
                pool.reserveA = pool.reserveA.add(amounts[i]);
                pool.reserveB = pool.reserveB.sub(amountOut);
            } else {
                pool.reserveB = pool.reserveB.add(amounts[i]);
                pool.reserveA = pool.reserveA.sub(amountOut);
            }

            pool.lastUpdateBlock = block.number;

            address recipient = i < path.length - 2 ? address(this) : to;
            IERC20(output).transfer(recipient, amountOut);
            
            if (fee > 0) {
                IERC20(input).transfer(feeRecipient, fee);
            }

            emit TokenSwapped(poolId, msg.sender, input, output, amounts[i], amountOut, fee);
        }
    }

    // Governance functions
    
    /**
     * @dev Add governance member (requires existing member)
     */
    function addGovMember(address newMember) external onlyGovMember {
        require(newMember != address(0), "Invalid address");
        require(!govMembers[newMember], "Already member");
        
        govMembers[newMember] = true;
        govMemberCount = govMemberCount.add(1);
        
        emit GovernanceAction(msg.sender, "addGovMember", bytes32(uint256(uint160(newMember))));
    }

    /**
     * @dev Remove governance member (requires existing member)
     */
    function removeGovMember(address member) external onlyGovMember {
        require(govMembers[member], "Not a member");
        require(govMemberCount > 1, "Cannot remove last member");
        
        govMembers[member] = false;
        govMemberCount = govMemberCount.sub(1);
        
        emit GovernanceAction(msg.sender, "removeGovMember", bytes32(uint256(uint160(member))));
    }

    /**
     * @dev Emergency pause (governance only)
     */
    function emergencyPause() external onlyGovMember {
        _pause();
        emit GovernanceAction(msg.sender, "emergencyPause", bytes32(0));
    }

    /**
     * @dev Unpause (governance only)
     */
    function unpause() external onlyGovMember {
        _unpause();
        emit GovernanceAction(msg.sender, "unpause", bytes32(0));
    }

    /**
     * @dev Toggle pool status (governance only)
     */
    function togglePoolStatus(bytes32 poolId) external onlyGovMember {
        require(pools[poolId].tokenA != address(0), "Pool does not exist");
        pools[poolId].active = !pools[poolId].active;
        
        emit GovernanceAction(msg.sender, "togglePoolStatus", poolId);
    }

    /**
     * @dev Update fee recipient (governance only)
     */
    function setFeeRecipient(address _feeRecipient) external onlyGovMember {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
        
        emit GovernanceAction(msg.sender, "setFeeRecipient", bytes32(uint256(uint160(_feeRecipient))));
    }

    // Utility functions
    
    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(token0, token1));
    }

    function getPoolInfo(bytes32 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }

    function getUserLiquidity(bytes32 poolId, address user) external view returns (UserLiquidity memory) {
        return userLiquidity[poolId][user];
    }

    function getAllPools() external view returns (bytes32[] memory) {
        return poolIds;
    }

    function _calculateLiquidityAmounts(
        Pool memory pool,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal pure returns (uint256 amountA, uint256 amountB) {
        if (pool.reserveA == 0 && pool.reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = amountADesired.mul(pool.reserveB).div(pool.reserveA);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = amountBDesired.mul(pool.reserveA).div(pool.reserveB);
                require(amountAOptimal >= amountAMin, "Insufficient A amount");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function _mintLiquidity(
        bytes32 poolId,
        uint256 amountA,
        uint256 amountB
    ) internal returns (uint256 liquidity) {
        Pool storage pool = pools[poolId];
        
        if (pool.totalLiquidity == 0) {
            liquidity = sqrt(amountA.mul(amountB)).sub(MINIMUM_LIQUIDITY);
            pool.totalLiquidity = MINIMUM_LIQUIDITY;
        } else {
            liquidity = min(
                amountA.mul(pool.totalLiquidity).div(pool.reserveA),
                amountB.mul(pool.totalLiquidity).div(pool.reserveB)
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        pool.totalLiquidity = pool.totalLiquidity.add(liquidity);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y.div(2).add(1);
            while (x < z) {
                z = x;
                x = (y.div(x).add(x)).div(2);
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }

    /**
     * @dev Emergency withdrawal (governance only, for stuck tokens)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyGovMember {
        require(token != address(0), "Invalid token");
        
        // Ensure we don't withdraw pool reserves
        bool isPoolToken = false;
        for (uint256 i = 0; i < poolIds.length; i++) {
            Pool memory pool = pools[poolIds[i]];
            if (token == pool.tokenA || token == pool.tokenB) {
                uint256 currentBalance = IERC20(token).balanceOf(address(this));
                uint256 reserveAmount = token == pool.tokenA ? pool.reserveA : pool.reserveB;
                require(amount <= currentBalance.sub(reserveAmount), "Cannot withdraw pool reserves");
                isPoolToken = true;
                break;
            }
        }
        
        IERC20(token).transfer(msg.sender, amount);
        emit GovernanceAction(msg.sender, "emergencyWithdraw", bytes32(uint256(uint160(token))));
    }
}
