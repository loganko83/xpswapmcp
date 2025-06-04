// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract XpSwapDEX {
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feeRate; // in basis points (30 = 0.3%)
        bool active;
    }

    struct UserLiquidity {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => UserLiquidity)) public userLiquidity;
    mapping(address => bool) public supportedTokens;
    
    bytes32[] public poolIds;
    address public owner;
    address public feeRecipient;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant BASIS_POINTS = 10000;

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
        uint256 liquidity
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

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        _;
    }

    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    function createPool(
        address tokenA,
        address tokenB,
        uint256 feeRate
    ) external onlyOwner returns (bytes32 poolId) {
        require(tokenA != tokenB, "Identical addresses");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feeRate <= 1000, "Invalid fee rate"); // max 10%

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
        supportedTokens[token0] = true;
        supportedTokens[token1] = true;

        emit PoolCreated(poolId, token0, token1, feeRate);
    }

    function addLiquidity(
        bytes32 poolId,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool inactive");

        (amountA, amountB) = _calculateLiquidityAmounts(
            pool,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        liquidity = _mintLiquidity(poolId, amountA, amountB);

        IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountB);

        pool.reserveA += amountA;
        pool.reserveB += amountB;

        userLiquidity[poolId][msg.sender].amount += liquidity;

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }

    function removeLiquidity(
        bytes32 poolId,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        require(pool.active, "Pool inactive");
        require(userLiquidity[poolId][msg.sender].amount >= liquidity, "Insufficient liquidity");

        amountA = liquidity * pool.reserveA / pool.totalLiquidity;
        amountB = liquidity * pool.reserveB / pool.totalLiquidity;

        require(amountA >= amountAMin && amountB >= amountBMin, "Insufficient output");

        userLiquidity[poolId][msg.sender].amount -= liquidity;
        pool.totalLiquidity -= liquidity;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).transfer(msg.sender, amountA);
        IERC20(pool.tokenB).transfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        require(supportedTokens[path[0]] && supportedTokens[path[path.length - 1]], "Unsupported token");

        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output amount");

        IERC20(path[0]).transferFrom(msg.sender, address(this), amounts[0]);
        _swap(amounts, path, to);
    }

    function getAmountsOut(uint256 amountIn, address[] memory path)
        public
        view
        returns (uint256[] memory amounts)
    {
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i; i < path.length - 1; i++) {
            bytes32 poolId = getPoolId(path[i], path[i + 1]);
            Pool memory pool = pools[poolId];
            require(pool.active, "Pool inactive");

            amounts[i + 1] = getAmountOut(amounts[i], path[i], path[i + 1], pool);
        }
    }

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

        uint256 amountInWithFee = amountIn * (BASIS_POINTS - pool.feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * BASIS_POINTS + amountInWithFee;
        amountOut = numerator / denominator;
    }

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
            uint256 amountBOptimal = amountADesired * pool.reserveB / pool.reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = amountBDesired * pool.reserveA / pool.reserveB;
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
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            pool.totalLiquidity = MINIMUM_LIQUIDITY;
        } else {
            liquidity = min(
                amountA * pool.totalLiquidity / pool.reserveA,
                amountB * pool.totalLiquidity / pool.reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        pool.totalLiquidity += liquidity;
    }

    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address to
    ) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            bytes32 poolId = getPoolId(input, output);
            Pool storage pool = pools[poolId];
            
            uint256 amountOut = amounts[i + 1];
            uint256 fee = amounts[i] * pool.feeRate / BASIS_POINTS;
            
            if (input == pool.tokenA) {
                pool.reserveA += amounts[i];
                pool.reserveB -= amountOut;
            } else {
                pool.reserveB += amounts[i];
                pool.reserveA -= amountOut;
            }

            address recipient = i < path.length - 2 ? address(this) : to;
            IERC20(output).transfer(recipient, amountOut);
            
            if (fee > 0) {
                IERC20(input).transfer(feeRecipient, fee);
            }

            emit TokenSwapped(poolId, msg.sender, input, output, amounts[i], amountOut, fee);
        }
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function togglePoolStatus(bytes32 poolId) external onlyOwner {
        pools[poolId].active = !pools[poolId].active;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}