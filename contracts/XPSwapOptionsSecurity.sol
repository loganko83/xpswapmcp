// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title XPSwap Options Trading Security
 * @dev 옵션 거래를 위한 전용 보안 컨트랙트
 */
contract XPSwapOptionsSecurity is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    
    // 옵션 유형
    enum OptionType { Call, Put }
    enum OptionStatus { Active, Expired, Exercised, Cancelled }
    
    // 옵션 보안 파라미터
    struct OptionSecurityParams {
        uint256 minStrike;           // 최소 행사가
        uint256 maxStrike;           // 최대 행사가
        uint256 minExpiry;           // 최소 만료일 (현재 시각 + 최소 기간)
        uint256 maxExpiry;           // 최대 만료일 (현재 시각 + 최대 기간)
        uint256 maxPremium;          // 최대 프리미엄
        uint256 minPremium;          // 최소 프리미엄
        uint256 maxNotional;         // 최대 명목금액
        uint256 volatilityThreshold; // 변동성 임계값
        bool isActive;               // 활성화 상태
    }
    
    // 옵션 정보
    struct OptionInfo {
        address underlying;          // 기초자산
        OptionType optionType;      // 옵션 유형
        uint256 strike;             // 행사가
        uint256 expiry;             // 만료일
        uint256 premium;            // 프리미엄
        uint256 notional;           // 명목금액
        address writer;             // 옵션 작성자
        address holder;             // 옵션 보유자
        OptionStatus status;        // 상태
        uint256 timestamp;          // 생성 시간
        bytes32 optionId;           // 옵션 ID
    }    
    // 스토리지
    mapping(address => OptionSecurityParams) public securityParams;
    mapping(bytes32 => OptionInfo) public options;
    mapping(address => uint256) public userOptionCount;
    mapping(address => uint256) public userDailyVolume;
    mapping(address => uint256) public lastVolumeReset;
    mapping(address => bool) public authorizedWriters;
    
    // 글로벌 제한
    uint256 public constant MAX_DAILY_VOLUME_PER_USER = 100000 * 10**18;
    uint256 public constant MAX_OPTIONS_PER_USER = 50;
    uint256 public constant MIN_TIME_BETWEEN_TRADES = 60; // 1분
    uint256 public constant VOLUME_RESET_PERIOD = 24 hours;
    
    // 상태 추적
    mapping(address => uint256) public lastTradeTime;
    uint256 public totalActiveOptions;
    uint256 public totalNotionalValue;
    
    // 이벤트
    event OptionCreated(
        bytes32 indexed optionId,
        address indexed underlying,
        address indexed writer,
        OptionType optionType,
        uint256 strike,
        uint256 expiry,
        uint256 premium
    );
    
    event SecurityViolation(
        address indexed user,
        string violationType,
        uint256 timestamp
    );
    
    event VolatilityAlert(
        address indexed underlying,
        uint256 currentVolatility,
        uint256 threshold
    );    
    // 수정자들
    modifier onlyAuthorizedWriter() {
        require(authorizedWriters[msg.sender] || msg.sender == owner(), "Not authorized writer");
        _;
    }
    
    modifier rateLimited() {
        require(
            block.timestamp >= lastTradeTime[msg.sender].add(MIN_TIME_BETWEEN_TRADES),
            "Rate limit exceeded"
        );
        lastTradeTime[msg.sender] = block.timestamp;
        _;
    }
    
    modifier volumeLimited(uint256 notionalAmount) {
        _checkDailyVolume(msg.sender, notionalAmount);
        _;
    }
    
    modifier validOptionParams(
        address underlying,
        uint256 strike,
        uint256 expiry,
        uint256 premium,
        uint256 notional
    ) {
        require(_validateOptionParams(underlying, strike, expiry, premium, notional), "Invalid option parameters");
        _;
    }
    
    // 보안 파라미터 설정
    function setSecurityParams(
        address underlying,
        OptionSecurityParams memory params
    ) external onlyOwner {
        require(underlying != address(0), "Invalid underlying");
        require(params.minStrike < params.maxStrike, "Invalid strike range");
        require(params.minExpiry < params.maxExpiry, "Invalid expiry range");
        require(params.minPremium < params.maxPremium, "Invalid premium range");
        
        securityParams[underlying] = params;
    }    
    // 옵션 생성 (보안 검증 포함)
    function createOption(
        address underlying,
        OptionType optionType,
        uint256 strike,
        uint256 expiry,
        uint256 premium,
        uint256 notional,
        address holder
    ) external 
        nonReentrant
        onlyAuthorizedWriter
        rateLimited
        volumeLimited(notional)
        validOptionParams(underlying, strike, expiry, premium, notional)
        returns (bytes32 optionId)
    {
        require(userOptionCount[msg.sender] < MAX_OPTIONS_PER_USER, "Max options limit reached");
        require(holder != address(0), "Invalid holder");
        require(expiry > block.timestamp, "Invalid expiry");
        
        // 옵션 ID 생성
        optionId = keccak256(
            abi.encodePacked(
                underlying,
                msg.sender,
                holder,
                strike,
                expiry,
                block.timestamp,
                totalActiveOptions
            )
        );
        
        // 옵션 정보 저장
        options[optionId] = OptionInfo({
            underlying: underlying,
            optionType: optionType,
            strike: strike,
            expiry: expiry,
            premium: premium,
            notional: notional,
            writer: msg.sender,
            holder: holder,
            status: OptionStatus.Active,
            timestamp: block.timestamp,
            optionId: optionId
        });
        
        // 카운터 업데이트
        userOptionCount[msg.sender] = userOptionCount[msg.sender].add(1);
        totalActiveOptions = totalActiveOptions.add(1);
        totalNotionalValue = totalNotionalValue.add(notional);
        
        emit OptionCreated(optionId, underlying, msg.sender, optionType, strike, expiry, premium);
    }    
    // 옵션 행사 (보안 검증 포함)
    function exerciseOption(bytes32 optionId) external nonReentrant {
        OptionInfo storage option = options[optionId];
        require(option.holder == msg.sender, "Not option holder");
        require(option.status == OptionStatus.Active, "Option not active");
        require(block.timestamp <= option.expiry, "Option expired");
        
        // 행사 조건 검증
        require(_canExercise(optionId), "Cannot exercise option");
        
        // 상태 업데이트
        option.status = OptionStatus.Exercised;
        totalActiveOptions = totalActiveOptions.sub(1);
        totalNotionalValue = totalNotionalValue.sub(option.notional);
        
        // 행사 로직 실행
        _executeExercise(optionId);
    }
    
    // 옵션 만료 처리
    function expireOption(bytes32 optionId) external {
        OptionInfo storage option = options[optionId];
        require(option.status == OptionStatus.Active, "Option not active");
        require(block.timestamp > option.expiry, "Option not expired yet");
        
        option.status = OptionStatus.Expired;
        totalActiveOptions = totalActiveOptions.sub(1);
        totalNotionalValue = totalNotionalValue.sub(option.notional);
    }
    
    // 일일 거래량 체크
    function _checkDailyVolume(address user, uint256 notionalAmount) internal {
        if (block.timestamp > lastVolumeReset[user].add(VOLUME_RESET_PERIOD)) {
            userDailyVolume[user] = 0;
            lastVolumeReset[user] = block.timestamp;
        }
        
        require(
            userDailyVolume[user].add(notionalAmount) <= MAX_DAILY_VOLUME_PER_USER,
            "Daily volume limit exceeded"
        );
        
        userDailyVolume[user] = userDailyVolume[user].add(notionalAmount);
    }    
    // 옵션 파라미터 검증
    function _validateOptionParams(
        address underlying,
        uint256 strike,
        uint256 expiry,
        uint256 premium,
        uint256 notional
    ) internal view returns (bool) {
        OptionSecurityParams memory params = securityParams[underlying];
        
        if (!params.isActive) return false;
        if (strike < params.minStrike || strike > params.maxStrike) return false;
        if (expiry < block.timestamp.add(params.minExpiry) || 
            expiry > block.timestamp.add(params.maxExpiry)) return false;
        if (premium < params.minPremium || premium > params.maxPremium) return false;
        if (notional > params.maxNotional) return false;
        
        return true;
    }
    
    // 옵션 행사 가능 여부 확인
    function _canExercise(bytes32 optionId) internal view returns (bool) {
        OptionInfo memory option = options[optionId];
        
        // 현재 가격 가져오기 (오라클 연동 필요)
        uint256 currentPrice = _getCurrentPrice(option.underlying);
        
        if (option.optionType == OptionType.Call) {
            return currentPrice > option.strike;
        } else {
            return currentPrice < option.strike;
        }
    }
    
    // 현재 가격 가져오기 (오라클 연동)
    function _getCurrentPrice(address underlying) internal view returns (uint256) {
        // 실제 구현에서는 가격 오라클 연동
        return 100 * 10**18; // 임시값
    }
    
    // 옵션 행사 실행
    function _executeExercise(bytes32 optionId) internal {
        // 실제 행사 로직 구현
        OptionInfo memory option = options[optionId];
        uint256 currentPrice = _getCurrentPrice(option.underlying);
        
        uint256 payout = 0;
        if (option.optionType == OptionType.Call && currentPrice > option.strike) {
            payout = currentPrice.sub(option.strike).mul(option.notional).div(10**18);
        } else if (option.optionType == OptionType.Put && currentPrice < option.strike) {
            payout = option.strike.sub(currentPrice).mul(option.notional).div(10**18);
        }
        
        // 실제 토큰 전송 로직 필요
        // 임시로 이벤트만 발생
        if (payout > 0) {
            emit OptionCreated(optionId, option.underlying, option.writer, option.optionType, option.strike, option.expiry, payout);
        }
    }    
    // 권한 관리
    function authorizeWriter(address writer, bool authorized) external onlyOwner {
        authorizedWriters[writer] = authorized;
    }
    
    // 보안 상태 조회
    function getSecurityStatus(address user) external view returns (
        uint256 optionCount,
        uint256 remainingDailyVolume,
        uint256 nextTradeTime,
        bool canTrade
    ) {
        optionCount = userOptionCount[user];
        remainingDailyVolume = MAX_DAILY_VOLUME_PER_USER.sub(userDailyVolume[user]);
        nextTradeTime = lastTradeTime[user].add(MIN_TIME_BETWEEN_TRADES);
        canTrade = block.timestamp >= nextTradeTime && optionCount < MAX_OPTIONS_PER_USER;
    }
    
    // 옵션 정보 조회
    function getOptionInfo(bytes32 optionId) external view returns (OptionInfo memory) {
        return options[optionId];
    }
    
    // 활성 옵션 개수 조회
    function getActiveOptionsCount() external view returns (uint256) {
        return totalActiveOptions;
    }
    
    // 총 명목가치 조회
    function getTotalNotionalValue() external view returns (uint256) {
        return totalNotionalValue;
    }
    
    // 긴급 정지 (옵션 생성 중단)
    function emergencyPause(address underlying) external onlyOwner {
        securityParams[underlying].isActive = false;
        emit SecurityViolation(msg.sender, "EMERGENCY_PAUSE", block.timestamp);
    }
    
    // 변동성 경고 발생
    function alertHighVolatility(address underlying, uint256 currentVolatility) external onlyOwner {
        OptionSecurityParams memory params = securityParams[underlying];
        if (currentVolatility > params.volatilityThreshold) {
            emit VolatilityAlert(underlying, currentVolatility, params.volatilityThreshold);
        }
    }
}