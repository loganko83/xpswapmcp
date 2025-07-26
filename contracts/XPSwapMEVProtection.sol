// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XPSwap MEV Protection
 * @dev MEV(Maximal Extractable Value) 공격으로부터 보호하는 컨트랙트
 */
contract XPSwapMEVProtection is ReentrancyGuard, EIP712, Ownable {
    using ECDSA for bytes32;
    
    // MEV 보호 유형
    enum ProtectionLevel { None, Basic, Advanced, Maximum }
    
    // 거래 주문 구조
    struct ProtectedOrder {
        address trader;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        uint256 nonce;
        uint256 maxSlippage;     // 최대 슬리피지 (basis points)
        ProtectionLevel protection;
        bytes32 commitHash;      // 커밋-리빌 방식용
        uint256 revealDeadline;  // 리빌 데드라인
    }
    
    // 배치 거래
    struct BatchOrder {
        ProtectedOrder[] orders;
        uint256 batchNonce;
        bytes32 merkleRoot;
    }
    
    // 스토리지
    mapping(address => uint256) public userNonces;
    mapping(bytes32 => bool) public usedOrderHashes;
    mapping(bytes32 => uint256) public commitments;
    mapping(address => uint256) public lastBlockTraded;
    mapping(address => uint256) public tradingGasPrice;
    
    // MEV 보호 설정
    mapping(address => ProtectionLevel) public userProtectionLevel;
    mapping(address => bool) public whitelistedRelayers;
    
    // 글로벌 설정
    uint256 public constant MAX_SLIPPAGE = 1000; // 10%
    uint256 public constant MIN_COMMIT_DURATION = 2; // 2 블록
    uint256 public constant MAX_COMMIT_DURATION = 20; // 20 블록
    uint256 public constant GAS_PRICE_THRESHOLD = 50 gwei;
    
    // 프라이빗 멤풀 큐
    mapping(uint256 => ProtectedOrder[]) public privateMempool;
    uint256 public currentBatch;
    uint256 public batchProcessingDelay = 3; // 3 블록    
    // 이벤트
    event OrderCommitted(
        bytes32 indexed commitHash,
        address indexed trader,
        uint256 revealDeadline
    );
    
    event OrderRevealed(
        bytes32 indexed orderHash,
        address indexed trader,
        uint256 blockNumber
    );
    
    event MEVDetected(
        address indexed attacker,
        address indexed victim,
        uint256 extractedValue,
        uint256 blockNumber
    );
    
    event BatchProcessed(
        uint256 indexed batchId,
        uint256 orderCount,
        uint256 blockNumber
    );
    
    constructor() EIP712("XPSwap", "1.0.0") {}
    
    // 커밋-리빌 방식 주문 제출
    function commitOrder(bytes32 commitHash, uint256 revealDeadline) 
        external 
        nonReentrant 
    {
        require(revealDeadline > block.number + MIN_COMMIT_DURATION, "Reveal too early");
        require(revealDeadline < block.number + MAX_COMMIT_DURATION, "Reveal too late");
        require(commitments[commitHash] == 0, "Commitment already exists");
        
        commitments[commitHash] = revealDeadline;
        
        emit OrderCommitted(commitHash, msg.sender, revealDeadline);
    }    
    // 주문 리빌 및 실행
    function revealAndExecute(
        ProtectedOrder calldata order,
        uint256 salt,
        bytes calldata signature
    ) external nonReentrant {
        // 커밋 해시 검증
        bytes32 commitHash = keccak256(abi.encodePacked(
            _hashOrder(order),
            salt,
            msg.sender
        ));
        
        require(commitments[commitHash] != 0, "Invalid commitment");
        require(block.number <= commitments[commitHash], "Reveal deadline passed");
        require(block.number >= commitments[commitHash] - MAX_COMMIT_DURATION + MIN_COMMIT_DURATION, "Too early to reveal");
        
        // 주문 해시 생성 및 중복 검사
        bytes32 orderHash = _hashOrder(order);
        require(!usedOrderHashes[orderHash], "Order already executed");
        require(order.trader == msg.sender, "Invalid trader");
        require(order.deadline >= block.timestamp, "Order expired");
        
        // 서명 검증
        require(_verifySignature(order, signature), "Invalid signature");
        
        // MEV 보호 검증
        _checkMEVProtection(order);
        
        // 주문 실행
        usedOrderHashes[orderHash] = true;
        commitments[commitHash] = 0; // 커밋 제거
        
        _executeProtectedSwap(order);
        
        emit OrderRevealed(orderHash, msg.sender, block.number);
    }
    
    // 프라이빗 멤풀에 주문 추가
    function submitToPrivateMempool(
        ProtectedOrder calldata order,
        bytes calldata signature
    ) external {
        require(whitelistedRelayers[msg.sender] || msg.sender == order.trader, "Unauthorized");
        require(order.protection >= ProtectionLevel.Advanced, "Insufficient protection level");
        require(_verifySignature(order, signature), "Invalid signature");
        
        privateMempool[currentBatch].push(order);
        
        // 배치가 가득 찬 경우 다음 배치로 이동
        if (privateMempool[currentBatch].length >= 10) {
            currentBatch++;
        }
    }    
    // 배치 주문 처리
    function processBatch(uint256 batchId) external {
        require(whitelistedRelayers[msg.sender] || msg.sender == owner(), "Unauthorized");
        require(batchId < currentBatch, "Batch not ready");
        require(block.number >= batchId + batchProcessingDelay, "Batch delay not met");
        
        ProtectedOrder[] storage batch = privateMempool[batchId];
        require(batch.length > 0, "Empty batch");
        
        // 배치 내 주문들을 공정한 순서로 실행
        _executeBatch(batch, batchId);
        
        // 배치 정리
        delete privateMempool[batchId];
        
        emit BatchProcessed(batchId, batch.length, block.number);
    }
    
    // MEV 공격 탐지 및 보호
    function _checkMEVProtection(ProtectedOrder memory order) internal {
        // 1. 같은 블록 내 반복 거래 방지
        if (order.protection >= ProtectionLevel.Basic) {
            require(lastBlockTraded[order.trader] < block.number, "Same block trading");
            lastBlockTraded[order.trader] = block.number;
        }
        
        // 2. 가스 가격 기반 보호
        if (order.protection >= ProtectionLevel.Advanced) {
            require(tx.gasprice <= GAS_PRICE_THRESHOLD, "Gas price too high");
        }
        
        // 3. 슬리피지 보호
        require(order.maxSlippage <= MAX_SLIPPAGE, "Slippage too high");
        
        // 4. 프론트러닝 탐지
        if (order.protection == ProtectionLevel.Maximum) {
            _detectFrontRunning(order);
        }
    }
    
    // 프론트러닝 탐지
    function _detectFrontRunning(ProtectedOrder memory order) internal {
        // 이전 거래들과의 유사성 검사
        // 비정상적인 가스 가격 증가 패턴 탐지
        // MEV 봇의 알려진 패턴 매칭
        
        uint256 avgGasPrice = _getAverageGasPrice();
        if (tx.gasprice > avgGasPrice * 12 / 10) { // 20% 이상 증가
            emit MEVDetected(tx.origin, order.trader, 0, block.number);
            revert("Potential MEV attack detected");
        }
    }    
    // 주문 해시 생성 (EIP-712)
    function _hashOrder(ProtectedOrder memory order) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ProtectedOrder(address trader,address tokenIn,address tokenOut,uint256 amountIn,uint256 minAmountOut,uint256 deadline,uint256 nonce,uint256 maxSlippage,uint8 protection)"),
            order.trader,
            order.tokenIn,
            order.tokenOut,
            order.amountIn,
            order.minAmountOut,
            order.deadline,
            order.nonce,
            order.maxSlippage,
            uint8(order.protection)
        )));
    }
    
    // 서명 검증
    function _verifySignature(ProtectedOrder memory order, bytes memory signature) internal view returns (bool) {
        bytes32 orderHash = _hashOrder(order);
        address signer = orderHash.recover(signature);
        return signer == order.trader;
    }
    
    // 배치 실행
    function _executeBatch(ProtectedOrder[] storage batch, uint256 batchId) internal {
        // 공정한 실행 순서 결정 (예: 가스 가격 순서가 아닌 타임스탬프 순서)
        for (uint256 i = 0; i < batch.length; i++) {
            ProtectedOrder storage order = batch[i];
            
            if (order.deadline >= block.timestamp && !usedOrderHashes[_hashOrder(order)]) {
                usedOrderHashes[_hashOrder(order)] = true;
                _executeProtectedSwap(order);
            }
        }
    }
    
    // 보호된 스왑 실행
    function _executeProtectedSwap(ProtectedOrder memory order) internal {
        // 실제 DEX 스왑 로직
        // 슬리피지 검증 포함
        
        // 임시 구현 - 실제로는 DEX 컨트랙트 호출
        userNonces[order.trader]++;
    }
    
    // 평균 가스 가격 계산
    function _getAverageGasPrice() internal view returns (uint256) {
        // 최근 N개 블록의 평균 가스 가격 계산
        // 임시 구현
        return 20 gwei;
    }    
    // 설정 함수들
    function setProtectionLevel(ProtectionLevel level) external {
        userProtectionLevel[msg.sender] = level;
    }
    
    function setWhitelistedRelayer(address relayer, bool whitelisted) external onlyOwner {
        whitelistedRelayers[relayer] = whitelisted;
    }
    
    function setBatchProcessingDelay(uint256 delay) external onlyOwner {
        require(delay <= 10, "Delay too long");
        batchProcessingDelay = delay;
    }
    
    // 조회 함수들
    function getUserNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }
    
    function isOrderUsed(bytes32 orderHash) external view returns (bool) {
        return usedOrderHashes[orderHash];
    }
    
    function getCommitment(bytes32 commitHash) external view returns (uint256) {
        return commitments[commitHash];
    }
    
    function getBatchSize(uint256 batchId) external view returns (uint256) {
        return privateMempool[batchId].length;
    }
    
    function getCurrentBatch() external view returns (uint256) {
        return currentBatch;
    }
    
    // MEV 보호 통계
    function getMEVProtectionStats(address user) external view returns (
        ProtectionLevel protectionLevel,
        uint256 nonce,
        uint256 lastTradeBlock,
        bool canTradeThisBlock
    ) {
        protectionLevel = userProtectionLevel[user];
        nonce = userNonces[user];
        lastTradeBlock = lastBlockTraded[user];
        canTradeThisBlock = lastTradeBlock < block.number || protectionLevel == ProtectionLevel.None;
    }
}