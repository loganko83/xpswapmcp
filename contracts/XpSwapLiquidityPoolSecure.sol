// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title XpSwapLiquidityPoolSecure
 * @dev Enhanced security AMM liquidity pool with comprehensive protection mechanisms
 * Features: Reentrancy protection, integer overflow protection, MEV resistance,
 * flash loan protection, and decentralized governance
 */
contract XpSwapLiquidityPoolSecure is ERC20, ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // Pool tokens
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    
    // Pool reserves with overflow protection
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public blockTimestampLast;
    
    // Enhanced fee configuration
    uint256 public constant FEE_RATE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_FEE_RATE = 1000; // 10% maximum
    
    // Security constants
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    uint256 public constant MIN_BLOCK_DELAY = 2; // MEV protection
    uint256 public constant MAX_SWAP_RATIO = 5000; // 50% max of reserves
    
    // Flash loan protection
    uint256 public constant FLASH_LOAN_FEE = 9; // 0.09%
    mapping(address => uint256) public flashLoanDebt;
    bool public flashLoansEnabled = true;
    
    // Price oracle with manipulation resistance
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint256 public constant ORACLE_UPDATE_THRESHOLD = 1800; // 30 minutes
    
    // MEV and sandwich attack protection
    mapping(address => uint256) public lastTxBlock;
    mapping(address => uint256) public txCountPerBlock;
    uint256 public constant MAX_TX_PER_BLOCK = 3;
    
    // Governance
    mapping(address => bool) public authorized;
    uint256 public authorizedCount;
    
    // Circuit breaker for emergency situations
    uint256 public constant PRICE_IMPACT_THRESHOLD = 1000; // 10%
    bool public circuitBreakerActive;
    uint256 public lastCircuitBreakerReset;
    
    // Events
    event Mint(address indexed sender, uint256 amountA, uint256 amountB);
    event Burn(address indexed sender, uint256 amountA, uint256 amountB, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut,
        address indexed to,
        uint256 priceImpact
    );
    event Sync(uint256 reserveA, uint256 reserveB);
    event FlashLoan(address indexed borrower, uint256 amount, uint256 fee);
    event CircuitBreakerTriggered(uint256 priceImpact, uint256 timestamp);
    event AuthorizedAdded(address indexed account);
    event AuthorizedRemoved(address indexed account);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier antiMEV() {
        require(
            block.number > lastTxBlock[msg.sender].add(MIN_BLOCK_DELAY), 
            "MEV protection: too frequent"
        );
        require(
            txCountPerBlock[msg.sender] < MAX_TX_PER_BLOCK,
            "MEV protection: too many tx per block"
        );
        
        if (lastTxBlock[msg.sender] < block.number) {
            txCountPerBlock[msg.sender] = 0;
        }
        
        lastTxBlock[msg.sender] = block.number;
        txCountPerBlock[msg.sender] = txCountPerBlock[msg.sender].add(1);
        _;
    }
    
    modifier circuitBreakerCheck() {
        require(!circuitBreakerActive, "Circuit breaker active");
        _;
    }
    
    modifier flashLoanCheck() {
        require(flashLoanDebt[msg.sender] == 0, "Outstanding flash loan");
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
        
        // Initialize governance
        authorized[msg.sender] = true;
        authorizedCount = 1;
        
        lastCircuitBreakerReset = block.timestamp;
    }
    
    /**
     * @dev Add liquidity with enhanced security
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant antiMEV circuitBreakerCheck whenNotPaused 
       returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        
        require(to != address(0), "Invalid recipient");
        require(amountADesired > 0 && amountBDesired > 0, "Invalid amounts");
        
        (amountA, amountB) = _addLiquidity(amountADesired, amountBDesired, amountAMin, amountBMin);
        
        // Verify token transfers with balance checks
        uint256 balanceABefore = tokenA.balanceOf(address(this));
        uint256 balanceBBefore = tokenB.balanceOf(address(this));
        
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        
        require(
            tokenA.balanceOf(address(this)) == balanceABefore.add(amountA),
            "Token A transfer verification failed"
        );
        require(
            tokenB.balanceOf(address(this)) == balanceBBefore.add(amountB),
            "Token B transfer verification failed"
        );
        
        liquidity = _mint(to);
        
        emit Mint(msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Remove liquidity with enhanced security
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant antiMEV circuitBreakerCheck whenNotPaused 
       returns (uint256 amountA, uint256 amountB) {
        
        require(to != address(0), "Invalid recipient");
        require(liquidity > 0, "Insufficient liquidity");
        require(balanceOf(msg.sender) >= liquidity, "Insufficient LP tokens");
        
        // Transfer LP tokens to contract
        _transfer(msg.sender, address(this), liquidity);
        
        (amountA, amountB) = _burn(to);
        
        require(amountA >= amountAMin, "Insufficient token A");
        require(amountB >= amountBMin, "Insufficient token B");
        
        emit Burn(msg.sender, amountA, amountB, to);
    }
    
    /**
     * @dev Secure swap with comprehensive protection
     */
    function swap(
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut,
        address to
    ) external nonReentrant antiMEV circuitBreakerCheck flashLoanCheck whenNotPaused {
        require(amountAOut > 0 || amountBOut > 0, "Insufficient output amount");
        require(amountAOut < reserveA && amountBOut < reserveB, "Insufficient liquidity");
        require(to != address(tokenA) && to != address(tokenB), "Invalid recipient");
        require(to != address(0), "Invalid recipient");
        
        // Enhanced slippage and manipulation protection
        uint256 maxSwapA = reserveA.mul(MAX_SWAP_RATIO).div(FEE_DENOMINATOR);
        uint256 maxSwapB = reserveB.mul(MAX_SWAP_RATIO).div(FEE_DENOMINATOR);
        require(amountAOut <= maxSwapA && amountBOut <= maxSwapB, "Swap too large");
        
        // Calculate price impact before swap
        uint256 priceImpact = _calculatePriceImpact(amountAIn, amountBIn, amountAOut, amountBOut);
        
        // Circuit breaker check
        if (priceImpact > PRICE_IMPACT_THRESHOLD) {
            circuitBreakerActive = true;
            emit CircuitBreakerTriggered(priceImpact, block.timestamp);
            revert("Circuit breaker activated: high price impact");
        }
        
        // Store reserves before swap for invariant check
        uint256 reserveABefore = reserveA;
        uint256 reserveBBefore = reserveB;
        
        // Transfer input tokens with verification
        if (amountAIn > 0) {
            uint256 balanceBefore = tokenA.balanceOf(address(this));
            tokenA.transferFrom(msg.sender, address(this), amountAIn);
            require(
                tokenA.balanceOf(address(this)) == balanceBefore.add(amountAIn),
                "Input token A transfer failed"
            );
        }
        if (amountBIn > 0) {
            uint256 balanceBefore = tokenB.balanceOf(address(this));
            tokenB.transferFrom(msg.sender, address(this), amountBIn);
            require(
                tokenB.balanceOf(address(this)) == balanceBefore.add(amountBIn),
                "Input token B transfer failed"
            );
        }
        
        // Transfer output tokens
        if (amountAOut > 0) tokenA.transfer(to, amountAOut);
        if (amountBOut > 0) tokenB.transfer(to, amountBOut);
        
        // Update reserves and validate invariant
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        
        // Calculate amounts with fees
        uint256 amountAInWithFee = amountAIn > 0 ? 
            amountAIn.mul(FEE_DENOMINATOR.sub(FEE_RATE)).div(FEE_DENOMINATOR) : 0;
        uint256 amountBInWithFee = amountBIn > 0 ? 
            amountBIn.mul(FEE_DENOMINATOR.sub(FEE_RATE)).div(FEE_DENOMINATOR) : 0;
        
        // Constant product formula validation (K >= K')
        uint256 kBefore = reserveABefore.mul(reserveBBefore);
        uint256 kAfter = (reserveABefore.sub(amountAOut).add(amountAInWithFee))
            .mul(reserveBBefore.sub(amountBOut).add(amountBInWithFee));
        
        require(kAfter >= kBefore, "K invariant violated");
        
        _update(balanceA, balanceB);
        
        emit Swap(msg.sender, amountAIn, amountBIn, amountAOut, amountBOut, to, priceImpact);
    }
    
    /**
     * @dev Flash loan with enhanced security
     */
    function flashLoan(
        uint256 amountA,
        uint256 amountB,
        bytes calldata data
    ) external nonReentrant antiMEV circuitBreakerCheck whenNotPaused {
        require(flashLoansEnabled, "Flash loans disabled");
        require(amountA <= reserveA || amountB <= reserveB, "Insufficient liquidity");
        
        uint256 feeA = amountA.mul(FLASH_LOAN_FEE).div(FEE_DENOMINATOR);
        uint256 feeB = amountB.mul(FLASH_LOAN_FEE).div(FEE_DENOMINATOR);
        
        // Record debt
        flashLoanDebt[msg.sender] = amountA.add(feeA).add(amountB.add(feeB));
        
        // Store balances before
        uint256 balanceABefore = tokenA.balanceOf(address(this));
        uint256 balanceBBefore = tokenB.balanceOf(address(this));
        
        // Transfer tokens
        if (amountA > 0) tokenA.transfer(msg.sender, amountA);
        if (amountB > 0) tokenB.transfer(msg.sender, amountB);
        
        // Callback to borrower
        IFlashLoanReceiver(msg.sender).onFlashLoan(amountA, amountB, feeA, feeB, data);
        
        // Verify repayment
        uint256 balanceAAfter = tokenA.balanceOf(address(this));
        uint256 balanceBAfter = tokenB.balanceOf(address(this));
        
        require(balanceAAfter >= balanceABefore.add(feeA), "Flash loan A not repaid");
        require(balanceBAfter >= balanceBBefore.add(feeB), "Flash loan B not repaid");
        
        // Clear debt
        flashLoanDebt[msg.sender] = 0;
        
        _update(balanceAAfter, balanceBAfter);
        
        emit FlashLoan(msg.sender, amountA.add(amountB), feeA.add(feeB));
    }
    
    /**
     * @dev Calculate price impact of a swap
     */
    function _calculatePriceImpact(
        uint256 amountAIn,
        uint256 amountBIn,
        uint256 amountAOut,
        uint256 amountBOut
    ) internal view returns (uint256 priceImpact) {
        if (amountAIn > 0) {
            priceImpact = amountAOut.mul(FEE_DENOMINATOR).div(reserveA);
        } else if (amountBIn > 0) {
            priceImpact = amountBOut.mul(FEE_DENOMINATOR).div(reserveB);
        }
    }
    
    // Governance functions
    
    /**
     * @dev Add authorized user
     */
    function addAuthorized(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!authorized[account], "Already authorized");
        
        authorized[account] = true;
        authorizedCount = authorizedCount.add(1);
        
        emit AuthorizedAdded(account);
    }
    
    /**
     * @dev Remove authorized user
     */
    function removeAuthorized(address account) external onlyOwner {
        require(authorized[account], "Not authorized");
        require(authorizedCount > 1, "Cannot remove last authorized");
        
        authorized[account] = false;
        authorizedCount = authorizedCount.sub(1);
        
        emit AuthorizedRemoved(account);
    }
    
    /**
     * @dev Reset circuit breaker (authorized only)
     */
    function resetCircuitBreaker() external onlyAuthorized {
        require(
            block.timestamp >= lastCircuitBreakerReset.add(3600), // 1 hour cooldown
            "Circuit breaker cooldown active"
        );
        
        circuitBreakerActive = false;
        lastCircuitBreakerReset = block.timestamp;
    }
    
    /**
     * @dev Toggle flash loans (authorized only)
     */
    function toggleFlashLoans() external onlyAuthorized {
        flashLoansEnabled = !flashLoansEnabled;
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyAuthorized {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyAuthorized {
        _unpause();
    }
    
    // View functions
    
    /**
     * @dev Get swap quote for exact input with slippage info
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public pure returns (uint256 amountOut, uint256 priceImpact) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn.mul(FEE_DENOMINATOR.sub(FEE_RATE));
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(FEE_DENOMINATOR).add(amountInWithFee);
        amountOut = numerator.div(denominator);
        
        priceImpact = amountOut.mul(FEE_DENOMINATOR).div(reserveOut);
    }
    
    /**
     * @dev Get swap quote for exact output
     */
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256 amountIn) {
        require(amountOut > 0, "Insufficient output amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        uint256 numerator = reserveIn.mul(amountOut).mul(FEE_DENOMINATOR);
        uint256 denominator = reserveOut.sub(amountOut).mul(FEE_DENOMINATOR.sub(FEE_RATE));
        amountIn = numerator.div(denominator).add(1);
    }
    
    /**
     * @dev Force reserves to match balances (emergency function)
     */
    function sync() external onlyAuthorized {
        _update(tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
    }
    
    /**
     * @dev Get current reserves and timestamp
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB, uint256 _blockTimestampLast) {
        _reserveA = reserveA;
        _reserveB = reserveB;
        _blockTimestampLast = blockTimestampLast;
    }
    
    /**
     * @dev Get pool health status
     */
    function getPoolHealth() external view returns (
        bool healthy,
        uint256 priceDeviation,
        bool circuitBreakerStatus,
        uint256 lastUpdate
    ) {
        healthy = !circuitBreakerActive && !paused();
        circuitBreakerStatus = circuitBreakerActive;
        lastUpdate = blockTimestampLast;
        
        // Calculate price deviation from initial ratio
        if (reserveA > 0 && reserveB > 0) {
            priceDeviation = 0; // Could implement historical price tracking
        }
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
            uint256 amountBOptimal = amountADesired.mul(reserveB).div(reserveA);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient token B");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = amountBDesired.mul(reserveA).div(reserveB);
                require(amountAOptimal <= amountADesired && amountAOptimal >= amountAMin, "Insufficient token A");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    
    function _mint(address to) internal returns (uint256 liquidity) {
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        uint256 amountA = balanceA.sub(reserveA);
        uint256 amountB = balanceB.sub(reserveB);
        
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = _sqrt(amountA.mul(amountB)).sub(MINIMUM_LIQUIDITY);
            _mint(BURN_ADDRESS, MINIMUM_LIQUIDITY); // Permanently lock minimum liquidity
        } else {
            liquidity = _min(
                amountA.mul(_totalSupply).div(reserveA), 
                amountB.mul(_totalSupply).div(reserveB)
            );
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
        amountA = liquidity.mul(balanceA).div(_totalSupply);
        amountB = liquidity.mul(balanceB).div(_totalSupply);
        
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
        
        uint256 timeElapsed = block.timestamp.sub(blockTimestampLast);
        if (timeElapsed > 0 && reserveA != 0 && reserveB != 0) {
            // Update price oracle with manipulation resistance
            if (timeElapsed >= ORACLE_UPDATE_THRESHOLD) {
                price0CumulativeLast = price0CumulativeLast.add(
                    reserveB.mul(2**112).div(reserveA).mul(timeElapsed)
                );
                price1CumulativeLast = price1CumulativeLast.add(
                    reserveA.mul(2**112).div(reserveB).mul(timeElapsed)
                );
            }
        }
        
        reserveA = balanceA;
        reserveB = balanceB;
        blockTimestampLast = block.timestamp;
        
        emit Sync(reserveA, reserveB);
    }
    
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
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
    
    function _min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
}

/**
 * @dev Interface for flash loan receivers
 */
interface IFlashLoanReceiver {
    function onFlashLoan(
        uint256 amountA,
        uint256 amountB,
        uint256 feeA,
        uint256 feeB,
        bytes calldata data
    ) external;
}
