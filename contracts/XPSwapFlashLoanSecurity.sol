// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title XPSwap Flash Loan Security
 * @dev Flash Loan 공격을 방지하고 안전한 Flash Loan 서비스를 제공하는 컨트랙트
 */
contract XPSwapFlashLoanSecurity is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    
    // Flash Loan 상태
    enum LoanStatus { None, Active, Repaid, Defaulted }
    
    // Flash Loan 정보
    struct FlashLoan {
        address borrower;
        address asset;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        uint256 deadline;
        LoanStatus status;
        bytes32 loanId;
    }
    
    // 보안 설정
    struct SecurityParams {
        uint256 maxLoanAmount;       // 최대 대출 금액
        uint256 minCooldown;         // 최소 쿨다운 시간
        uint256 maxDailyVolume;      // 일일 최대 대출량
        uint256 feeRate;             // 수수료율 (basis points)
        bool isActive;               // 활성화 상태
    }
    
    // 스토리지
    mapping(address => SecurityParams) public assetParams;
    mapping(address => uint256) public userCooldowns;
    mapping(address => uint256) public userDailyVolume;
    mapping(address => uint256) public lastVolumeReset;
    mapping(bytes32 => FlashLoan) public loans;
    mapping(address => bool) public authorizedCallers;
    mapping(address => uint256) public consecutiveDefaults;
    
    // 글로벌 제한
    uint256 public constant MAX_LOAN_DURATION = 1; // 1 블록
    uint256 public constant MIN_FEE_RATE = 30; // 0.3%
    uint256 public constant MAX_FEE_RATE = 1000; // 10%
    uint256 public constant VOLUME_RESET_PERIOD = 24 hours;
    uint256 public constant MAX_CONSECUTIVE_DEFAULTS = 3;
    
    // 활성 대출 추적
    bytes32[] public activeLoanIds;
    mapping(address => bytes32[]) public userLoans;    
    // 이벤트
    event FlashLoanInitiated(
        bytes32 indexed loanId,
        address indexed borrower,
        address indexed asset,
        uint256 amount,
        uint256 fee
    );
    
    event FlashLoanRepaid(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 fee
    );
    
    event FlashLoanDefaulted(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 amount
    );
    
    event SuspiciousActivity(
        address indexed user,
        string activityType,
        uint256 timestamp
    );
    
    // 인터페이스
    interface IFlashLoanReceiver {
        function executeOperation(
            address asset,
            uint256 amount,
            uint256 fee,
            bytes calldata params
        ) external returns (bool);
    }
    
    // Flash Loan 실행
    function flashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        require(authorizedCallers[msg.sender] || msg.sender == tx.origin, "Unauthorized caller");
        require(_validateFlashLoan(asset, amount, msg.sender), "Validation failed");
        
        SecurityParams memory assetParam = assetParams[asset];
        uint256 fee = amount.mul(assetParam.feeRate).div(10000);
        
        // 대출 ID 생성
        bytes32 loanId = keccak256(abi.encodePacked(
            msg.sender,
            asset,
            amount,
            block.timestamp,
            block.number
        ));
        
        // 대출 정보 저장
        loans[loanId] = FlashLoan({
            borrower: msg.sender,
            asset: asset,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp,
            deadline: block.timestamp + MAX_LOAN_DURATION,
            status: LoanStatus.Active,
            loanId: loanId
        });
        
        activeLoanIds.push(loanId);
        userLoans[msg.sender].push(loanId);
        
        // 쿨다운 및 볼륨 업데이트
        _updateUserLimits(msg.sender, amount);
        
        emit FlashLoanInitiated(loanId, msg.sender, asset, amount, fee);        
        // 토큰 전송
        IERC20(asset).safeTransfer(msg.sender, amount);
        
        // 콜백 실행
        require(
            IFlashLoanReceiver(msg.sender).executeOperation(asset, amount, fee, params),
            "Callback execution failed"
        );
        
        // 상환 확인
        uint256 amountOwed = amount.add(fee);
        require(
            IERC20(asset).balanceOf(address(this)) >= amountOwed,
            "Insufficient repayment"
        );
        
        // 대출 상태 업데이트
        loans[loanId].status = LoanStatus.Repaid;
        _removeActiveLoan(loanId);
        
        emit FlashLoanRepaid(loanId, msg.sender, amount, fee);
    }
    
    // Flash Loan 검증
    function _validateFlashLoan(
        address asset,
        uint256 amount,
        address borrower
    ) internal view returns (bool) {
        SecurityParams memory params = assetParams[asset];
        
        // 기본 검증
        if (!params.isActive) return false;
        if (amount > params.maxLoanAmount) return false;
        if (amount == 0) return false;
        
        // 쿨다운 검증
        if (block.timestamp < userCooldowns[borrower]) return false;
        
        // 일일 볼륨 검증
        if (_getCurrentDailyVolume(borrower).add(amount) > params.maxDailyVolume) return false;
        
        // 연속 디폴트 검증
        if (consecutiveDefaults[borrower] >= MAX_CONSECUTIVE_DEFAULTS) return false;
        
        // 충분한 유동성 확인
        if (IERC20(asset).balanceOf(address(this)) < amount) return false;
        
        return true;
    }