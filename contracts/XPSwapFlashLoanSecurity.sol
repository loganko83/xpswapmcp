// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title XPSwap Flash Loan Security
 * @dev Flash loan functionality with enhanced security
 */
contract XPSwapFlashLoanSecurity is ReentrancyGuard, Ownable {
    
    struct FlashLoanData {
        address asset;
        uint256 amount;
        uint256 fee;
        address borrower;
    }
    
    mapping(address => bool) public authorizedCallers;
    mapping(address => uint256) public cooldowns;
    
    uint256 public constant FLASH_LOAN_FEE = 9; // 0.09%
    uint256 public constant COOLDOWN_PERIOD = 10 minutes;
    
    event FlashLoan(address indexed borrower, address indexed asset, uint256 amount, uint256 fee);
    
    constructor() Ownable(msg.sender) {}
    
    function executeFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant {
        require(authorizedCallers[msg.sender], "Unauthorized");
        require(block.timestamp >= cooldowns[msg.sender] + COOLDOWN_PERIOD, "Cooldown active");
        
        uint256 fee = (amount * FLASH_LOAN_FEE) / 10000;
        uint256 balanceBefore = IERC20(asset).balanceOf(address(this));
        
        // Transfer tokens to borrower
        IERC20(asset).transfer(msg.sender, amount);
        
        // Execute borrower's logic
        (bool success, ) = msg.sender.call(data);
        require(success, "Flash loan execution failed");
        
        // Check repayment
        uint256 balanceAfter = IERC20(asset).balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "Flash loan not repaid");
        
        cooldowns[msg.sender] = block.timestamp;
        
        emit FlashLoan(msg.sender, asset, amount, fee);
    }
    
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }
}
