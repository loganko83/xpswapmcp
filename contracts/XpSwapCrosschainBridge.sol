// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title XpSwapCrosschainBridge
 * @dev 크로스체인 브리지 컨트랙트
 */
contract XpSwapCrosschainBridge is ReentrancyGuard, Ownable, Pausable {
    using ECDSA for bytes32;
    
    struct BridgeTransaction {
        bytes32 txHash;
        address fromToken;
        address toToken;
        uint256 amount;
        address sender;
        address recipient;
        uint256 fromChainId;
        uint256 toChainId;
        uint256 timestamp;
        BridgeStatus status;
        uint256 fee;
        bytes32 proof;
    }
    
    enum BridgeStatus {
        Pending,
        Confirmed,
        Completed,
        Failed,
        Refunded
    }
    
    mapping(bytes32 => BridgeTransaction) public bridgeTransactions;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public validators;
    mapping(bytes32 => bool) public processedTxs;
    mapping(bytes32 => mapping(address => bool)) public validatorConfirmations;
    mapping(bytes32 => uint256) public confirmationCount;
    
    uint256 public bridgeFee = 10; // 0.1% in basis points
    uint256 public minBridgeAmount = 1 * 10**18; // 1 token minimum
    uint256 public maxBridgeAmount = 1000000 * 10**18; // 1M token maximum
    uint256 public requiredConfirmations = 3;
    uint256 public validatorCount;
    
    address public feeRecipient;
    
    event BridgeInitiated(
        bytes32 indexed txHash,
        address indexed sender,
        address indexed recipient,
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 fromChainId,
        uint256 toChainId,
        uint256 fee
    );
    
    event BridgeConfirmed(
        bytes32 indexed txHash,
        address indexed validator,
        uint256 confirmations
    );
    
    event BridgeCompleted(
        bytes32 indexed txHash,
        address indexed recipient,
        uint256 amount
    );
    
    event BridgeFailed(
        bytes32 indexed txHash,
        string reason
    );
    
    event BridgeRefunded(
        bytes32 indexed txHash,
        address indexed sender,
        uint256 amount
    );
    
    event TokenSupported(address indexed token, bool supported);
    event ChainSupported(uint256 indexed chainId, bool supported);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    
    constructor(
        address _feeRecipient,
        uint256 _currentChainId
    ) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        supportedChains[_currentChainId] = true;
    }
    
    /**
     * @dev 브리지 전송 시작
     */
    function initiateBridge(
        address _fromToken,
        address _toToken,
        uint256 _amount,
        address _recipient,
        uint256 _toChainId
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        require(supportedTokens[_fromToken], "Token not supported");
        require(supportedChains[_toChainId], "Chain not supported");
        require(_amount >= minBridgeAmount, "Amount below minimum");
        require(_amount <= maxBridgeAmount, "Amount exceeds maximum");
        require(_recipient != address(0), "Invalid recipient");
        require(_toChainId != block.chainid, "Cannot bridge to same chain");
        
        // Calculate fee
        uint256 fee = (_amount * bridgeFee) / 10000;
        uint256 bridgeAmount = _amount - fee;
        
        // Transfer tokens from sender
        IERC20(_fromToken).transferFrom(msg.sender, address(this), _amount);
        
        // Transfer fee to fee recipient
        if (fee > 0) {
            IERC20(_fromToken).transfer(feeRecipient, fee);
        }
        
        // Generate unique transaction hash
        bytes32 txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _fromToken,
                _toToken,
                _amount,
                block.chainid,
                _toChainId,
                block.timestamp,
                block.number
            )
        );
        
        // Store bridge transaction
        bridgeTransactions[txHash] = BridgeTransaction({
            txHash: txHash,
            fromToken: _fromToken,
            toToken: _toToken,
            amount: bridgeAmount,
            sender: msg.sender,
            recipient: _recipient,
            fromChainId: block.chainid,
            toChainId: _toChainId,
            timestamp: block.timestamp,
            status: BridgeStatus.Pending,
            fee: fee,
            proof: bytes32(0)
        });
        
        emit BridgeInitiated(
            txHash,
            msg.sender,
            _recipient,
            _fromToken,
            _toToken,
            bridgeAmount,
            block.chainid,
            _toChainId,
            fee
        );
        
        return txHash;
    }
    
    /**
     * @dev 브리지 전송 완료 (대상 체인에서)
     */
    function completeBridge(
        bytes32 _txHash,
        address _toToken,
        uint256 _amount,
        address _recipient,
        bytes32 _proof
    ) external nonReentrant whenNotPaused {
        require(validators[msg.sender], "Not a validator");
        require(!processedTxs[_txHash], "Transaction already processed");
        require(!validatorConfirmations[_txHash][msg.sender], "Already confirmed by this validator");
        
        // Record validator confirmation
        validatorConfirmations[_txHash][msg.sender] = true;
        confirmationCount[_txHash]++;
        
        emit BridgeConfirmed(_txHash, msg.sender, confirmationCount[_txHash]);
        
        // Check if enough confirmations
        if (confirmationCount[_txHash] >= requiredConfirmations) {
            processedTxs[_txHash] = true;
            
            // Mint or transfer tokens to recipient
            try IERC20(_toToken).transfer(_recipient, _amount) {
                emit BridgeCompleted(_txHash, _recipient, _amount);
            } catch {
                emit BridgeFailed(_txHash, "Token transfer failed");
            }
        }
    }
    
    /**
     * @dev 브리지 전송 실패 처리
     */
    function failBridge(
        bytes32 _txHash,
        string memory _reason
    ) external {
        require(validators[msg.sender], "Not a validator");
        
        BridgeTransaction storage bridgeTx = bridgeTransactions[_txHash];
        require(bridgeTx.status == BridgeStatus.Pending, "Invalid status");
        
        bridgeTx.status = BridgeStatus.Failed;
        
        emit BridgeFailed(_txHash, _reason);
    }
    
    /**
     * @dev 브리지 전송 환불
     */
    function refundBridge(bytes32 _txHash) external nonReentrant {
        BridgeTransaction storage bridgeTx = bridgeTransactions[_txHash];
        require(bridgeTx.status == BridgeStatus.Failed, "Bridge not failed");
        require(msg.sender == bridgeTx.sender || validators[msg.sender], "Not authorized");
        
        bridgeTx.status = BridgeStatus.Refunded;
        
        // Refund tokens to sender
        IERC20(bridgeTx.fromToken).transfer(bridgeTx.sender, bridgeTx.amount);
        
        emit BridgeRefunded(_txHash, bridgeTx.sender, bridgeTx.amount);
    }
    
    /**
     * @dev 브리지 전송 상태 확인
     */
    function getBridgeStatus(bytes32 _txHash) external view returns (
        BridgeStatus status,
        uint256 confirmations,
        uint256 required
    ) {
        BridgeTransaction storage bridgeTx = bridgeTransactions[_txHash];
        status = bridgeTx.status;
        confirmations = confirmationCount[_txHash];
        required = requiredConfirmations;
    }
    
    /**
     * @dev 브리지 전송 정보 조회
     */
    function getBridgeTransaction(bytes32 _txHash) external view returns (
        address fromToken,
        address toToken,
        uint256 amount,
        address sender,
        address recipient,
        uint256 fromChainId,
        uint256 toChainId,
        uint256 timestamp,
        BridgeStatus status,
        uint256 fee
    ) {
        BridgeTransaction storage bridgeTx = bridgeTransactions[_txHash];
        return (
            bridgeTx.fromToken,
            bridgeTx.toToken,
            bridgeTx.amount,
            bridgeTx.sender,
            bridgeTx.recipient,
            bridgeTx.fromChainId,
            bridgeTx.toChainId,
            bridgeTx.timestamp,
            bridgeTx.status,
            bridgeTx.fee
        );
    }
    
    /**
     * @dev 예상 브리지 수수료 계산
     */
    function calculateBridgeFee(uint256 _amount) external view returns (uint256) {
        return (_amount * bridgeFee) / 10000;
    }
    
    /**
     * @dev 지원되는 토큰 추가/제거 (Owner only)
     */
    function setSupportedToken(address _token, bool _supported) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedTokens[_token] = _supported;
        emit TokenSupported(_token, _supported);
    }
    
    /**
     * @dev 지원되는 체인 추가/제거 (Owner only)
     */
    function setSupportedChain(uint256 _chainId, bool _supported) external onlyOwner {
        require(_chainId > 0, "Invalid chain ID");
        supportedChains[_chainId] = _supported;
        emit ChainSupported(_chainId, _supported);
    }
    
    /**
     * @dev 검증자 추가 (Owner only)
     */
    function addValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid validator address");
        require(!validators[_validator], "Validator already exists");
        
        validators[_validator] = true;
        validatorCount++;
        
        emit ValidatorAdded(_validator);
    }
    
    /**
     * @dev 검증자 제거 (Owner only)
     */
    function removeValidator(address _validator) external onlyOwner {
        require(validators[_validator], "Validator does not exist");
        
        validators[_validator] = false;
        validatorCount--;
        
        emit ValidatorRemoved(_validator);
    }
    
    /**
     * @dev 브리지 수수료 설정 (Owner only)
     */
    function setBridgeFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        bridgeFee = _newFee;
    }
    
    /**
     * @dev 최소/최대 브리지 금액 설정 (Owner only)
     */
    function setBridgeAmountLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyOwner {
        require(_minAmount > 0, "Min amount must be greater than 0");
        require(_maxAmount > _minAmount, "Max amount must be greater than min");
        
        minBridgeAmount = _minAmount;
        maxBridgeAmount = _maxAmount;
    }
    
    /**
     * @dev 필요 확인 수 설정 (Owner only)
     */
    function setRequiredConfirmations(uint256 _confirmations) external onlyOwner {
        require(_confirmations > 0, "Confirmations must be greater than 0");
        require(_confirmations <= validatorCount, "Cannot exceed validator count");
        
        requiredConfirmations = _confirmations;
    }
    
    /**
     * @dev 수수료 수령 주소 설정 (Owner only)
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        feeRecipient = _newRecipient;
    }
    
    /**
     * @dev 일시 정지/재개
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 긴급 토큰 회수 (Owner only)
     */
    function emergencyWithdraw(
        address _token,
        uint256 _amount,
        address _to
    ) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        IERC20(_token).transfer(_to, _amount);
    }
    
    /**
     * @dev 검증자 여부 확인
     */
    function isValidator(address _validator) external view returns (bool) {
        return validators[_validator];
    }
    
    /**
     * @dev 토큰 지원 여부 확인
     */
    function isTokenSupported(address _token) external view returns (bool) {
        return supportedTokens[_token];
    }
    
    /**
     * @dev 체인 지원 여부 확인
     */
    function isChainSupported(uint256 _chainId) external view returns (bool) {
        return supportedChains[_chainId];
    }
}
