// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XPSwap MEV Protection
 * @dev Advanced MEV protection mechanisms
 */
contract XPSwapMEVProtection is ReentrancyGuard, Ownable {
    
    struct MEVProtection {
        uint256 lastTxBlock;
        uint256 txCountInBlock;
        uint256 lastTxTimestamp;
        bool flagged;
    }
    
    mapping(address => MEVProtection) public mevProtection;
    
    uint256 public constant MAX_TXS_PER_BLOCK = 3;
    uint256 public constant MEV_PROTECTION_BLOCKS = 2;
    
    event MEVDetected(address indexed user, uint256 blockNumber, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    function checkMEVProtection(address user, uint256 amount) external view returns (bool) {
        MEVProtection memory protection = mevProtection[user];
        
        if (block.number == protection.lastTxBlock) {
            if (protection.txCountInBlock >= MAX_TXS_PER_BLOCK) {
                return false;
            }
        }
        
        return !protection.flagged;
    }
    
    function updateMEVProtection(address user) external {
        MEVProtection storage protection = mevProtection[user];
        
        if (block.number > protection.lastTxBlock) {
            protection.txCountInBlock = 1;
        } else {
            protection.txCountInBlock++;
        }
        
        protection.lastTxBlock = block.number;
        protection.lastTxTimestamp = block.timestamp;
    }
}
