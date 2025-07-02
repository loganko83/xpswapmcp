// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title XpSwapLiquidityPool
 * @dev Automated Market Maker (AMM) liquidity pool with constant product formula
 * Implements x * y = k algorithm with fee collection and LP token rewards
 */
contract XpSwapLiquidityPool is ERC20, ReentrancyGuard, Ownable {
    using Math for uint256;

    // Pool tokens
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    
    // Pool reserves
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public blockTimestampLast;
    
    // Fee configuration (basis points)
    uint256 public constant FEE_RATE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Minimum liquidity to prevent zero division
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Price cumulative for oracle
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    
    // MEV protection
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    mapping(address => uint256) public lastTxBlock;
    uint256 public constant BLOCK_DELAY = 1; // Minimum blocks between transactions
    
    // Events
    event Mint(address indexed sender, uint256 amountA, uint256 amountB);
    event Burn(address indexed sender, uint256 amountA, uint256 amountB, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut,
        address indexed to
    );
    event Sync(uint256 reserveA, uint256 reserveB);
    
    modifier antiMEV() {
        require(block.number > lastTxBlock[msg.sender] + BLOCK_DELAY, "MEV protection: too frequent");
        lastTxBlock[msg.sender] = block.number;
        _;
    }
    
    constructor(
        address _tokenA,
        address _tokenB,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token addresses");
        require(_tokenA != _tokenB, "Identical tokens");
        
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        blockTimestampLast = block.timestamp;
    }
    
    /**
     * @dev Add liquidity to the pool
     * @param amountADesired Desired amount of token A
     * @param amountBDesired Desired amount of token B
     * @param amountAMin Minimum amount of token A
     * @param amountBMin Minimum amount of token B
     * @param to Address to receive LP tokens
     * @return amountA Actual amount of token A added
     * @return amountB Actual amount of token B added
     * @return liquidity LP tokens minted
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant antiMEV returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(to != address(0), "Invalid recipient");
        
        (amountA, amountB) = _addLiquidity(amountADesired, amountBDesired, amountAMin, amountBMin);
        
        // Transfer tokens to pool
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        
        liquidity = _mint(to);
        
        emit Mint(msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Remove liquidity from the pool
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum amount of token A to receive
     * @param amountBMin Minimum amount of token B to receive
     * @param to Address to receive tokens
     * @return amountA Amount of token A received
     * @return amountB Amount of token B received
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant antiMEV returns (uint256 amountA, uint256 amountB) {
        require(to != address(0), "Invalid recipient");
        require(liquidity > 0, "Insufficient liquidity");
        
        // Transfer LP tokens to contract
        _transfer(msg.sender, address(this), liquidity);
        
        (amountA, amountB) = _burn(to);
        
        require(amountA >= amountAMin, "Insufficient token A");
        require(amountB >= amountBMin, "Insufficient token B");
        
        emit Burn(msg.sender, amountA, amountB, to);
    }
    
    /**
     * @dev Swap tokens with slippage protection
     * @param amountAIn Amount of token A to swap in
     * @param amountBIn Amount of token B to swap in
     * @param amountAOut Amount of token A to receive
     * @param amountBOut Amount of token B to receive
     * @param to Address to receive output tokens
     */
    function swap(
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut,
        address to
    ) external nonReentrant antiMEV {
        require(amountAOut > 0 || amountBOut > 0, "Insufficient output amount");
        require(amountAOut < reserveA && amountBOut < reserveB, "Insufficient liquidity");
        require(to != address(tokenA) && to != address(tokenB), "Invalid recipient");
        
        // Slippage protection
        uint256 totalReserve = reserveA + reserveB;
        if (amountAOut > 0) {
            require(amountAOut * FEE_DENOMINATOR <= reserveA * MAX_SLIPPAGE, "Slippage too high");
        }
        if (amountBOut > 0) {
            require(amountBOut * FEE_DENOMINATOR <= reserveB * MAX_SLIPPAGE, "Slippage too high");
        }
        
        // Transfer input tokens
        if (amountAIn > 0) tokenA.transferFrom(msg.sender, address(this), amountAIn);
        if (amountBIn > 0) tokenB.transferFrom(msg.sender, address(this), amountBIn);
        
        // Transfer output tokens
        if (amountAOut > 0) tokenA.transfer(to, amountAOut);
        if (amountBOut > 0) tokenB.transfer(to, amountBOut);
        
        // Update reserves and validate invariant
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        
        uint256 amountAInWithFee = amountAIn > 0 ? amountAIn * (FEE_DENOMINATOR - FEE_RATE) / FEE_DENOMINATOR : 0;
        uint256 amountBInWithFee = amountBIn > 0 ? amountBIn * (FEE_DENOMINATOR - FEE_RATE) / FEE_DENOMINATOR : 0;
        
        require(
            balanceA * balanceB >= (reserveA - amountAOut + amountAInWithFee) * (reserveB - amountBOut + amountBInWithFee),
            "K invariant violated"
        );
        
        _update(balanceA, balanceB);
        
        emit Swap(msg.sender, amountAIn, amountBIn, amountAOut, amountBOut, to);
    }
    
    /**
     * @dev Get swap quote for exact input
     * @param amountIn Input amount
     * @param reserveIn Input token reserve
     * @param reserveOut Output token reserve
     * @return amountOut Output amount
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev Get swap quote for exact output
     * @param amountOut Output amount
     * @param reserveIn Input token reserve
     * @param reserveOut Output token reserve
     * @return amountIn Input amount needed
     */
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256 amountIn) {
        require(amountOut > 0, "Insufficient output amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * (FEE_DENOMINATOR - FEE_RATE);
        amountIn = (numerator / denominator) + 1;
    }
    
    /**
     * @dev Force reserves to match balances (emergency function)
     */
    function sync() external {
        _update(tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
    }
    
    /**
     * @dev Get current reserves
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB, uint256 _blockTimestampLast) {
        _reserveA = reserveA;
        _reserveB = reserveB;
        _blockTimestampLast = blockTimestampLast;
    }
    
    // Internal functions
    
    function _addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal view returns (uint256 amountA, uint256 amountB) {
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = amountADesired * reserveB / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient token B");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = amountBDesired * reserveA / reserveB;
                require(amountAOptimal <= amountADesired && amountAOptimal >= amountAMin, "Insufficient token A");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    
    function _mint(address to) internal returns (uint256 liquidity) {
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        uint256 amountA = balanceA - reserveA;
        uint256 amountB = balanceB - reserveB;
        
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(BURN_ADDRESS, MINIMUM_LIQUIDITY); // Permanently lock minimum liquidity
        } else {
            liquidity = Math.min(amountA * _totalSupply / reserveA, amountB * _totalSupply / reserveB);
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(to, liquidity);
        
        _update(balanceA, balanceB);
    }
    
    function _burn(address to) internal returns (uint256 amountA, uint256 amountB) {
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));
        
        uint256 _totalSupply = totalSupply();
        amountA = liquidity * balanceA / _totalSupply;
        amountB = liquidity * balanceB / _totalSupply;
        
        require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");
        
        _burn(address(this), liquidity);
        tokenA.transfer(to, amountA);
        tokenB.transfer(to, amountB);
        
        balanceA = tokenA.balanceOf(address(this));
        balanceB = tokenB.balanceOf(address(this));
        
        _update(balanceA, balanceB);
    }
    
    function _update(uint256 balanceA, uint256 balanceB) internal {
        require(balanceA <= type(uint112).max && balanceB <= type(uint112).max, "Overflow");
        
        uint256 timeElapsed = block.timestamp - blockTimestampLast;
        if (timeElapsed > 0 && reserveA != 0 && reserveB != 0) {
            // Update price oracle
            price0CumulativeLast += (reserveB * 2**112 / reserveA) * timeElapsed;
            price1CumulativeLast += (reserveA * 2**112 / reserveB) * timeElapsed;
        }
        
        reserveA = balanceA;
        reserveB = balanceB;
        blockTimestampLast = block.timestamp;
        
        emit Sync(reserveA, reserveB);
    }
}