// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XpSwapGovernanceToken
 * @dev ERC20 governance token with voting power and delegation capabilities
 * Used for protocol governance and yield farming rewards
 */
contract XpSwapGovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable, ReentrancyGuard {
    
    // Token configuration
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million initial supply
    
    // Distribution allocations
    uint256 public constant LIQUIDITY_MINING_ALLOCATION = 400000000 * 10**18; // 40%
    uint256 public constant TEAM_ALLOCATION = 200000000 * 10**18; // 20%
    uint256 public constant TREASURY_ALLOCATION = 200000000 * 10**18; // 20%
    uint256 public constant ECOSYSTEM_ALLOCATION = 100000000 * 10**18; // 10%
    uint256 public constant ADVISORS_ALLOCATION = 100000000 * 10**18; // 10%
    
    // Vesting configuration
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliffDuration;
        bool revocable;
        bool revoked;
    }
    
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // Liquidity mining
    mapping(address => bool) public authorizedMinters;
    uint256 public totalMinted;
    
    // Events
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender], "Not authorized minter");
        _;
    }
    
    constructor() 
        ERC20("XpSwap Governance Token", "XPSGOV") 
        ERC20Permit("XpSwap Governance Token") 
    {
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
        
        // Self-delegate voting power
        _delegate(msg.sender, msg.sender);
    }
    
    /**
     * @dev Authorize address to mint tokens for liquidity mining
     * @param minter Address to authorize
     */
    function authorizeMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    /**
     * @dev Revoke minter authorization
     * @param minter Address to revoke
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    /**
     * @dev Mint tokens for liquidity mining rewards
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyMinter nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(totalMinted + amount <= INITIAL_SUPPLY + LIQUIDITY_MINING_ALLOCATION, "Exceeds mining allocation");
        
        _mint(to, amount);
        totalMinted += amount;
        
        // Auto-delegate to self if no delegation exists
        if (delegates(to) == address(0)) {
            _delegate(to, to);
        }
    }
    
    /**
     * @dev Create vesting schedule for team/advisor tokens
     * @param beneficiary Address of the beneficiary
     * @param amount Total amount to vest
     * @param duration Vesting duration in seconds
     * @param cliffDuration Cliff period in seconds
     * @param revocable Whether the vesting can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration,
        uint256 cliffDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be positive");
        require(duration > 0, "Duration must be positive");
        require(cliffDuration <= duration, "Cliff longer than duration");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Vesting already exists");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            cliffDuration: cliffDuration,
            revocable: revocable,
            revoked: false
        });
        
        // Mint tokens to contract for vesting
        _mint(address(this), amount);
        totalMinted += amount;
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    /**
     * @dev Release vested tokens to beneficiary
     * @param beneficiary Address to release tokens for
     */
    function releaseVestedTokens(address beneficiary) external nonReentrant {
        VestingSchedule storage vesting = vestingSchedules[beneficiary];
        require(vesting.totalAmount > 0, "No vesting schedule");
        require(!vesting.revoked, "Vesting revoked");
        
        uint256 releasableAmount = _releasableAmount(beneficiary);
        require(releasableAmount > 0, "No tokens to release");
        
        vesting.releasedAmount += releasableAmount;
        _transfer(address(this), beneficiary, releasableAmount);
        
        // Auto-delegate to self if no delegation exists
        if (delegates(beneficiary) == address(0)) {
            _delegate(beneficiary, beneficiary);
        }
        
        emit TokensReleased(beneficiary, releasableAmount);
    }
    
    /**
     * @dev Revoke vesting schedule (owner only)
     * @param beneficiary Address whose vesting to revoke
     */
    function revokeVesting(address beneficiary) external onlyOwner {
        VestingSchedule storage vesting = vestingSchedules[beneficiary];
        require(vesting.totalAmount > 0, "No vesting schedule");
        require(vesting.revocable, "Vesting not revocable");
        require(!vesting.revoked, "Already revoked");
        
        uint256 releasableAmount = _releasableAmount(beneficiary);
        if (releasableAmount > 0) {
            vesting.releasedAmount += releasableAmount;
            _transfer(address(this), beneficiary, releasableAmount);
        }
        
        uint256 remainingAmount = vesting.totalAmount - vesting.releasedAmount;
        if (remainingAmount > 0) {
            _transfer(address(this), owner(), remainingAmount);
        }
        
        vesting.revoked = true;
        emit VestingRevoked(beneficiary);
    }
    
    /**
     * @dev Get releasable amount for beneficiary
     * @param beneficiary Address to check
     * @return Releasable token amount
     */
    function getReleasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }
    
    /**
     * @dev Get vesting schedule information
     * @param beneficiary Address to check
     * @return Vesting schedule details
     */
    function getVestingSchedule(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 startTime,
        uint256 duration,
        uint256 cliffDuration,
        bool revocable,
        bool revoked
    ) {
        VestingSchedule storage vesting = vestingSchedules[beneficiary];
        return (
            vesting.totalAmount,
            vesting.releasedAmount,
            vesting.startTime,
            vesting.duration,
            vesting.cliffDuration,
            vesting.revocable,
            vesting.revoked
        );
    }
    
    /**
     * @dev Batch transfer with automatic delegation
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer
     */
    function batchTransferWithDelegation(address[] calldata recipients, uint256[] calldata amounts) 
        external nonReentrant {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            
            _transfer(msg.sender, recipients[i], amounts[i]);
            
            // Auto-delegate to self if no delegation exists
            if (delegates(recipients[i]) == address(0)) {
                _delegate(recipients[i], recipients[i]);
            }
        }
    }
    
    /**
     * @dev Emergency pause function (owner only)
     */
    function pause() external onlyOwner {
        // Implementation for pausing transfers if needed
        // This would require additional pause functionality
    }
    
    // Internal functions
    
    function _releasableAmount(address beneficiary) internal view returns (uint256) {
        VestingSchedule storage vesting = vestingSchedules[beneficiary];
        if (vesting.totalAmount == 0 || vesting.revoked) {
            return 0;
        }
        
        if (block.timestamp < vesting.startTime + vesting.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= vesting.startTime + vesting.duration) {
            return vesting.totalAmount - vesting.releasedAmount;
        }
        
        uint256 timeElapsed = block.timestamp - vesting.startTime;
        uint256 vestedAmount = (vesting.totalAmount * timeElapsed) / vesting.duration;
        return vestedAmount - vesting.releasedAmount;
    }
    
    // The following functions are overrides required by Solidity
    
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }
    
    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }
    
    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}