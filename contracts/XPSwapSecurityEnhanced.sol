// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title XPSwap DEX 보안 강화 권장사항
 * @dev 프로덕션 환경을 위한 종합적인 보안 개선사항
 */

// 1. 향상된 액세스 제어
contract XPSwapSecurityEnhanced is ReentrancyGuard, Pausable, AccessControl {
    using SafeMath for uint256;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    // 2. 시간 기반 보안 제한
    mapping(address => uint256) public lastTradeTime;
    mapping(address => uint256) public dailyTradeVolume;
    mapping(address => uint256) public lastVolumeReset;
    
    uint256 public constant MIN_TRADE_INTERVAL = 1; // 1초
    uint256 public constant MAX_DAILY_VOLUME = 1000000 * 10**18; // 1M 토큰
    uint256 public constant VOLUME_RESET_PERIOD = 24 hours;
    
    // 3. 가격 오라클 보안
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(address => PriceData) public tokenPrices;
    uint256 public constant PRICE_VALIDITY_PERIOD = 5 minutes;
    uint256 public constant MAX_PRICE_DEVIATION = 500; // 5%    
    // 4. MEV 보호 메커니즘
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => uint256) public userNonces;
    
    struct TradeOrder {
        address trader;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        uint256 nonce;
        bytes signature;
    }
    
    // 5. Flash Loan 보안
    mapping(address => bool) public authorizedFlashLoanCallers;
    mapping(address => uint256) public flashLoanCooldowns;
    uint256 public constant FLASH_LOAN_COOLDOWN = 10 minutes;
    uint256 public constant MAX_FLASH_LOAN_AMOUNT = 10000000 * 10**18; // 10M
    
    // 6. 옵션 거래 보안
    struct OptionSecurity {
        uint256 maxStrike;
        uint256 minStrike;
        uint256 maxExpiry;
        uint256 minExpiry;
        uint256 maxPremium;
        bool isActive;
    }
    
    mapping(address => OptionSecurity) public optionSecurityParams;
    
    // 이벤트
    event SecurityAlert(
        address indexed user,
        string alertType,
        uint256 timestamp,
        bytes32 transactionHash
    );    
    event PriceAnomalyDetected(
        address indexed token,
        uint256 reportedPrice,
        uint256 expectedPrice,
        uint256 deviation
    );
    
    modifier rateLimited(address user) {
        require(
            block.timestamp >= lastTradeTime[user].add(MIN_TRADE_INTERVAL),
            "Trading too frequently"
        );
        lastTradeTime[user] = block.timestamp;
        _;
    }
    
    modifier volumeLimited(address user, uint256 amount) {
        // 일일 거래량 제한 검사
        if (block.timestamp > lastVolumeReset[user].add(VOLUME_RESET_PERIOD)) {
            dailyTradeVolume[user] = 0;
            lastVolumeReset[user] = block.timestamp;
        }
        
        require(
            dailyTradeVolume[user].add(amount) <= MAX_DAILY_VOLUME,
            "Daily volume limit exceeded"
        );
        
        dailyTradeVolume[user] = dailyTradeVolume[user].add(amount);
        _;
    }    
    modifier validPrice(address token) {
        PriceData memory priceData = tokenPrices[token];
        require(priceData.isValid, "Invalid price data");
        require(
            block.timestamp <= priceData.timestamp.add(PRICE_VALIDITY_PERIOD),
            "Price data expired"
        );
        _;
    }
    
    modifier nonceProtected(uint256 nonce, bytes memory signature) {
        bytes32 nonceHash = keccak256(abi.encodePacked(msg.sender, nonce));
        require(!usedNonces[nonceHash], "Nonce already used");
        require(nonce == userNonces[msg.sender], "Invalid nonce");
        
        usedNonces[nonceHash] = true;
        userNonces[msg.sender] = nonce.add(1);
        _;
    }
    
    // 7. 가격 오라클 업데이트 (다중 소스 검증)
    function updatePrice(
        address token,
        uint256 newPrice,
        bytes[] calldata signatures
    ) external onlyRole(OPERATOR_ROLE) {
        require(signatures.length >= 3, "Insufficient oracle signatures");
        
        // 기존 가격과의 편차 확인
        PriceData memory currentPrice = tokenPrices[token];
        if (currentPrice.isValid) {
            uint256 deviation = _calculateDeviation(currentPrice.price, newPrice);
            require(deviation <= MAX_PRICE_DEVIATION, "Price deviation too high");
            
            if (deviation > MAX_PRICE_DEVIATION.div(2)) {
                emit PriceAnomalyDetected(token, newPrice, currentPrice.price, deviation);
            }
        }
        
        tokenPrices[token] = PriceData({
            price: newPrice,
            timestamp: block.timestamp,
            isValid: true
        });
    }    
    // 8. MEV 보호 스왑
    function protectedSwap(
        TradeOrder calldata order
    ) external 
        nonReentrant 
        rateLimited(order.trader)
        volumeLimited(order.trader, order.amountIn)
        nonceProtected(order.nonce, order.signature)
        validPrice(order.tokenIn)
        validPrice(order.tokenOut)
    {
        require(block.timestamp <= order.deadline, "Order expired");
        require(_verifySignature(order), "Invalid signature");
        
        // 스왑 로직 실행
        _executeSwap(order);
    }
    
    // 9. 보안 강화 Flash Loan
    function secureFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        require(authorizedFlashLoanCallers[msg.sender], "Unauthorized caller");
        require(amount <= MAX_FLASH_LOAN_AMOUNT, "Amount exceeds limit");
        require(
            block.timestamp >= flashLoanCooldowns[msg.sender].add(FLASH_LOAN_COOLDOWN),
            "Cooldown period not elapsed"
        );
        
        flashLoanCooldowns[msg.sender] = block.timestamp;
        
        // Flash loan 실행
        _executeFlashLoan(asset, amount, params);
    }    
    // 10. 옵션 거래 보안 검증
    function secureOptionTrade(
        address underlying,
        uint256 strike,
        uint256 expiry,
        uint256 premium,
        bool isCall
    ) external nonReentrant rateLimited(msg.sender) {
        OptionSecurity memory security = optionSecurityParams[underlying];
        require(security.isActive, "Options not available for this asset");
        require(strike >= security.minStrike && strike <= security.maxStrike, "Invalid strike");
        require(expiry >= security.minExpiry && expiry <= security.maxExpiry, "Invalid expiry");
        require(premium <= security.maxPremium, "Premium too high");
        
        // 옵션 거래 실행
        _executeOptionTrade(underlying, strike, expiry, premium, isCall);
    }
    
    // 11. 긴급 정지 기능
    function emergencyPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit SecurityAlert(msg.sender, "EMERGENCY_PAUSE", block.timestamp, blockhash(block.number - 1));
    }
    
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit SecurityAlert(msg.sender, "EMERGENCY_UNPAUSE", block.timestamp, blockhash(block.number - 1));
    }    
    // 12. 의심스러운 활동 탐지
    function detectSuspiciousActivity(address user) public view returns (bool) {
        // 1. 과도한 거래 빈도
        if (block.timestamp < lastTradeTime[user].add(MIN_TRADE_INTERVAL.div(10))) {
            return true;
        }
        
        // 2. 비정상적인 거래량
        if (dailyTradeVolume[user] > MAX_DAILY_VOLUME.mul(80).div(100)) {
            return true;
        }
        
        // 3. Flash loan 남용
        if (block.timestamp < flashLoanCooldowns[user].add(FLASH_LOAN_COOLDOWN.div(2))) {
            return true;
        }
        
        return false;
    }
    
    // 13. 자동 위험 완화
    function autoRiskMitigation(address user) external onlyRole(OPERATOR_ROLE) {
        if (detectSuspiciousActivity(user)) {
            // 임시 거래 제한
            lastTradeTime[user] = block.timestamp.add(1 hours);
            flashLoanCooldowns[user] = block.timestamp.add(24 hours);
            
            emit SecurityAlert(user, "AUTO_RISK_MITIGATION", block.timestamp, blockhash(block.number - 1));
        }
    }    
    // 내부 함수들
    function _calculateDeviation(uint256 price1, uint256 price2) internal pure returns (uint256) {
        uint256 diff = price1 > price2 ? price1.sub(price2) : price2.sub(price1);
        return diff.mul(10000).div(price1); // 기준점 대비 편차 (bp)
    }
    
    function _verifySignature(TradeOrder calldata order) internal pure returns (bool) {
        // EIP-712 서명 검증 로직
        return true; // 구현 필요
    }
    
    function _executeSwap(TradeOrder calldata order) internal {
        // 스왑 실행 로직
    }
    
    function _executeFlashLoan(address asset, uint256 amount, bytes calldata params) internal {
        // Flash loan 실행 로직
    }
    
    function _executeOptionTrade(
        address underlying,
        uint256 strike,
        uint256 expiry,
        uint256 premium,
        bool isCall
    ) internal {
        // 옵션 거래 실행 로직
    }    
    // 14. 보안 설정 업데이트
    function updateSecurityParams(
        address token,
        OptionSecurity calldata newParams
    ) external onlyRole(ADMIN_ROLE) {
        optionSecurityParams[token] = newParams;
    }
    
    function authorizeFlashLoanCaller(address caller, bool authorized) 
        external onlyRole(ADMIN_ROLE) {
        authorizedFlashLoanCallers[caller] = authorized;
    }
    
    // 15. 보안 상태 조회
    function getSecurityStatus(address user) external view returns (
        bool isSuspicious,
        uint256 remainingVolume,
        uint256 nextTradeTime,
        uint256 flashLoanCooldownEnd
    ) {
        isSuspicious = detectSuspiciousActivity(user);
        remainingVolume = MAX_DAILY_VOLUME.sub(dailyTradeVolume[user]);
        nextTradeTime = lastTradeTime[user].add(MIN_TRADE_INTERVAL);
        flashLoanCooldownEnd = flashLoanCooldowns[user].add(FLASH_LOAN_COOLDOWN);
    }
}