// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title XpSwapCrosschainBridge
 * @dev Cross-chain bridge contract for transferring tokens between networks
 * Implements lock-mint and burn-unlock mechanisms with multi-signature validation
 */
contract XpSwapCrosschainBridge is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    
    // Roles
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
    
    // Bridge configuration
    struct BridgeConfig {
        uint256 chainId;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 dailyLimit;
        uint256 fee; // In basis points (10000 = 100%)
        bool isActive;
    }
    
    // Transaction types
    enum TransactionType { LOCK, UNLOCK, MINT, BURN }
    
    // Bridge transaction
    struct BridgeTransaction {
        bytes32 txHash;
        address token;
        address sender;
        address recipient;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 timestamp;
        TransactionType txType;
        bool completed;
        bool refunded;
    }
    
    // Supported networks and tokens
    mapping(uint256 => BridgeConfig) public supportedChains;
    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(uint256 => address)) public tokenMappings; // token => chainId => mappedToken
    
    // Bridge transactions
    mapping(bytes32 => BridgeTransaction) public bridgeTransactions;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(bytes32 => mapping(address => bool)) public validatorSignatures;
    mapping(bytes32 => uint256) public validatorCount;
    
    // Daily limits tracking
    mapping(uint256 => mapping(address => uint256)) public dailyTransferred; // chainId => token => amount
    mapping(uint256 => mapping(address => uint256)) public lastResetTime; // chainId => token => timestamp
    
    // Bridge statistics
    mapping(address => uint256) public totalLocked;
    mapping(address => uint256) public totalBurned;
    mapping(uint256 => uint256) public chainVolume;
    
    // Required validator signatures
    uint256 public requiredValidators = 3;
    uint256 public constant MAX_VALIDATORS = 10;
    
    // Events
    event TokenLocked(
        bytes32 indexed txHash,
        address indexed token,
        address indexed sender,
        address recipient,
        uint256 amount,
        uint256 targetChainId
    );
    
    event TokenUnlocked(
        bytes32 indexed txHash,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 sourceChainId
    );
    
    event TokenBurned(
        bytes32 indexed txHash,
        address indexed token,
        address indexed sender,
        address recipient,
        uint256 amount,
        uint256 targetChainId
    );
    
    event TokenMinted(
        bytes32 indexed txHash,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 sourceChainId
    );
    
    event ValidatorSigned(bytes32 indexed txHash, address indexed validator);
    event TransactionRefunded(bytes32 indexed txHash, address indexed recipient, uint256 amount);
    event ChainConfigUpdated(uint256 indexed chainId, bool isActive);
    event TokenMappingUpdated(address indexed sourceToken, uint256 indexed chainId, address targetToken);
    
    modifier onlyValidChain(uint256 chainId) {
        require(supportedChains[chainId].isActive, "Chain not supported");
        _;
    }
    
    modifier onlyValidToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(PAUSE_ROLE, msg.sender);
    }
    
    /**
     * @dev Lock tokens to bridge to another chain
     * @param token Token address to lock
     * @param amount Amount to lock
     * @param targetChainId Target chain ID
     * @param recipient Recipient address on target chain
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external nonReentrant whenNotPaused onlyValidToken(token) onlyValidChain(targetChainId) {
        require(amount > 0, "Amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        
        BridgeConfig memory config = supportedChains[targetChainId];
        require(amount >= config.minAmount && amount <= config.maxAmount, "Amount out of limits");
        
        // Check daily limits
        _checkDailyLimit(targetChainId, token, amount);
        
        // Calculate fee
        uint256 fee = (amount * config.fee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Generate transaction hash
        bytes32 txHash = keccak256(abi.encodePacked(
            token,
            msg.sender,
            recipient,
            amount,
            block.chainid,
            targetChainId,
            block.timestamp,
            block.number
        ));
        
        require(!processedTransactions[txHash], "Transaction already processed");
        
        // Store transaction
        bridgeTransactions[txHash] = BridgeTransaction({
            txHash: txHash,
            token: token,
            sender: msg.sender,
            recipient: recipient,
            amount: netAmount,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            timestamp: block.timestamp,
            txType: TransactionType.LOCK,
            completed: false,
            refunded: false
        });
        
        processedTransactions[txHash] = true;
        totalLocked[token] += netAmount;
        chainVolume[targetChainId] += netAmount;
        
        // Update daily limit
        _updateDailyLimit(targetChainId, token, amount);
        
        // Transfer tokens to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Transfer fee to admin (if any)
        if (fee > 0) {
            IERC20(token).safeTransfer(owner(), fee);
        }
        
        emit TokenLocked(txHash, token, msg.sender, recipient, netAmount, targetChainId);
    }
    
    /**
     * @dev Unlock tokens from another chain (validator only)
     * @param txHash Transaction hash from source chain
     * @param token Token address to unlock
     * @param recipient Recipient address
     * @param amount Amount to unlock
     * @param sourceChainId Source chain ID
     */
    function unlockTokens(
        bytes32 txHash,
        address token,
        address recipient,
        uint256 amount,
        uint256 sourceChainId
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant whenNotPaused {
        require(!processedTransactions[txHash], "Transaction already processed");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // Record validator signature
        if (!validatorSignatures[txHash][msg.sender]) {
            validatorSignatures[txHash][msg.sender] = true;
            validatorCount[txHash]++;
            emit ValidatorSigned(txHash, msg.sender);
        }
        
        // Check if enough validators have signed
        if (validatorCount[txHash] >= requiredValidators) {
            require(totalLocked[token] >= amount, "Insufficient locked tokens");
            
            // Store transaction
            bridgeTransactions[txHash] = BridgeTransaction({
                txHash: txHash,
                token: token,
                sender: address(0),
                recipient: recipient,
                amount: amount,
                sourceChainId: sourceChainId,
                targetChainId: block.chainid,
                timestamp: block.timestamp,
                txType: TransactionType.UNLOCK,
                completed: true,
                refunded: false
            });
            
            processedTransactions[txHash] = true;
            totalLocked[token] -= amount;
            
            // Transfer tokens to recipient
            IERC20(token).safeTransfer(recipient, amount);
            
            emit TokenUnlocked(txHash, token, recipient, amount, sourceChainId);
        }
    }
    
    /**
     * @dev Burn tokens to bridge to another chain (for wrapped tokens)
     * @param token Token address to burn
     * @param amount Amount to burn
     * @param targetChainId Target chain ID
     * @param recipient Recipient address on target chain
     */
    function burnTokens(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external nonReentrant whenNotPaused onlyValidToken(token) onlyValidChain(targetChainId) {
        require(amount > 0, "Amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        
        BridgeConfig memory config = supportedChains[targetChainId];
        require(amount >= config.minAmount && amount <= config.maxAmount, "Amount out of limits");
        
        // Check daily limits
        _checkDailyLimit(targetChainId, token, amount);
        
        // Calculate fee
        uint256 fee = (amount * config.fee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Generate transaction hash
        bytes32 txHash = keccak256(abi.encodePacked(
            token,
            msg.sender,
            recipient,
            amount,
            block.chainid,
            targetChainId,
            block.timestamp,
            block.number
        ));
        
        require(!processedTransactions[txHash], "Transaction already processed");
        
        // Store transaction
        bridgeTransactions[txHash] = BridgeTransaction({
            txHash: txHash,
            token: token,
            sender: msg.sender,
            recipient: recipient,
            amount: netAmount,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            timestamp: block.timestamp,
            txType: TransactionType.BURN,
            completed: false,
            refunded: false
        });
        
        processedTransactions[txHash] = true;
        totalBurned[token] += netAmount;
        chainVolume[targetChainId] += netAmount;
        
        // Update daily limit
        _updateDailyLimit(targetChainId, token, amount);
        
        // Transfer tokens to contract and burn
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Transfer fee to admin (if any)
        if (fee > 0) {
            IERC20(token).safeTransfer(owner(), fee);
        }
        
        emit TokenBurned(txHash, token, msg.sender, recipient, netAmount, targetChainId);
    }
    
    /**
     * @dev Mint tokens from another chain (validator only)
     * @param txHash Transaction hash from source chain
     * @param token Token address to mint
     * @param recipient Recipient address
     * @param amount Amount to mint
     * @param sourceChainId Source chain ID
     */
    function mintTokens(
        bytes32 txHash,
        address token,
        address recipient,
        uint256 amount,
        uint256 sourceChainId
    ) external onlyRole(VALIDATOR_ROLE) nonReentrant whenNotPaused {
        require(!processedTransactions[txHash], "Transaction already processed");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // Record validator signature
        if (!validatorSignatures[txHash][msg.sender]) {
            validatorSignatures[txHash][msg.sender] = true;
            validatorCount[txHash]++;
            emit ValidatorSigned(txHash, msg.sender);
        }
        
        // Check if enough validators have signed
        if (validatorCount[txHash] >= requiredValidators) {
            // Store transaction
            bridgeTransactions[txHash] = BridgeTransaction({
                txHash: txHash,
                token: token,
                sender: address(0),
                recipient: recipient,
                amount: amount,
                sourceChainId: sourceChainId,
                targetChainId: block.chainid,
                timestamp: block.timestamp,
                txType: TransactionType.MINT,
                completed: true,
                refunded: false
            });
            
            processedTransactions[txHash] = true;
            
            // Mint tokens to recipient (requires mintable token contract)
            // This would need to be implemented in the token contract
            // IERC20Mintable(token).mint(recipient, amount);
            
            emit TokenMinted(txHash, token, recipient, amount, sourceChainId);
        }
    }
    
    /**
     * @dev Get bridge transaction details
     * @param txHash Transaction hash
     */
    function getBridgeTransaction(bytes32 txHash) external view returns (BridgeTransaction memory) {
        return bridgeTransactions[txHash];
    }
    
    /**
     * @dev Get validator signature count for transaction
     * @param txHash Transaction hash
     */
    function getValidatorCount(bytes32 txHash) external view returns (uint256) {
        return validatorCount[txHash];
    }
    
    /**
     * @dev Check if validator has signed transaction
     * @param txHash Transaction hash
     * @param validator Validator address
     */
    function hasValidatorSigned(bytes32 txHash, address validator) external view returns (bool) {
        return validatorSignatures[txHash][validator];
    }
    
    // Internal functions
    
    function _checkDailyLimit(uint256 chainId, address token, uint256 amount) internal view {
        uint256 today = block.timestamp / 86400;
        uint256 lastReset = lastResetTime[chainId][token] / 86400;
        
        if (today == lastReset) {
            uint256 todayTransferred = dailyTransferred[chainId][token];
            require(todayTransferred + amount <= supportedChains[chainId].dailyLimit, "Daily limit exceeded");
        }
    }
    
    function _updateDailyLimit(uint256 chainId, address token, uint256 amount) internal {
        uint256 today = block.timestamp / 86400;
        uint256 lastReset = lastResetTime[chainId][token] / 86400;
        
        if (today > lastReset) {
            dailyTransferred[chainId][token] = amount;
            lastResetTime[chainId][token] = block.timestamp;
        } else {
            dailyTransferred[chainId][token] += amount;
        }
    }
    
    // Admin functions
    
    /**
     * @dev Configure supported chain
     * @param chainId Chain ID
     * @param config Bridge configuration
     */
    function configureChain(uint256 chainId, BridgeConfig memory config) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(chainId != block.chainid, "Cannot configure current chain");
        supportedChains[chainId] = config;
        emit ChainConfigUpdated(chainId, config.isActive);
    }
    
    /**
     * @dev Add supported token
     * @param token Token address
     */
    function addSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }
    
    /**
     * @dev Remove supported token
     * @param token Token address
     */
    function removeSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = false;
    }
    
    /**
     * @dev Set token mapping for cross-chain transfers
     * @param sourceToken Source token address
     * @param chainId Target chain ID
     * @param targetToken Target token address
     */
    function setTokenMapping(address sourceToken, uint256 chainId, address targetToken) 
        external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenMappings[sourceToken][chainId] = targetToken;
        emit TokenMappingUpdated(sourceToken, chainId, targetToken);
    }
    
    /**
     * @dev Set required validator count
     * @param _requiredValidators Number of required validators
     */
    function setRequiredValidators(uint256 _requiredValidators) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_requiredValidators > 0 && _requiredValidators <= MAX_VALIDATORS, "Invalid validator count");
        requiredValidators = _requiredValidators;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(PAUSE_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(PAUSE_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (admin only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
    
    function owner() public view returns (address) {
        return getRoleMember(DEFAULT_ADMIN_ROLE, 0);
    }
}