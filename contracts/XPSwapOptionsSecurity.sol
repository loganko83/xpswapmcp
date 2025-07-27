// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XPSwap Options Security
 * @dev Security layer for options trading
 */
contract XPSwapOptionsSecurity is ReentrancyGuard, Ownable {
    
    struct OptionSecurity {
        uint256 maxStrike;
        uint256 minStrike;
        uint256 maxExpiry;
        uint256 minExpiry;
        bool isActive;
    }
    
    mapping(address => OptionSecurity) public optionParams;
    mapping(address => bool) public authorizedTraders;
    
    event OptionSecurityUpdated(address indexed asset, uint256 maxStrike, uint256 minStrike);
    
    constructor() Ownable(msg.sender) {}
    
    function validateOption(
        address underlying,
        uint256 strike,
        uint256 expiry
    ) external view returns (bool) {
        OptionSecurity memory params = optionParams[underlying];
        
        if (!params.isActive) return false;
        if (strike < params.minStrike || strike > params.maxStrike) return false;
        if (expiry < params.minExpiry || expiry > params.maxExpiry) return false;
        
        return true;
    }
    
    function setOptionParams(
        address underlying,
        uint256 maxStrike,
        uint256 minStrike,
        uint256 maxExpiry,
        uint256 minExpiry,
        bool isActive
    ) external onlyOwner {
        optionParams[underlying] = OptionSecurity({
            maxStrike: maxStrike,
            minStrike: minStrike,
            maxExpiry: maxExpiry,
            minExpiry: minExpiry,
            isActive: isActive
        });
        
        emit OptionSecurityUpdated(underlying, maxStrike, minStrike);
    }
}
