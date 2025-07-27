// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Multi-Signature Wallet
 * @dev Simple multi-signature wallet for fund management
 */
contract MultiSigWallet is Ownable {
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public isOwner;
    
    address[] public owners;
    uint256 public required;
    uint256 public transactionCount;
    
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event SubmitTransaction(uint256 indexed transactionId);
    
    modifier onlyWallet() {
        require(msg.sender == address(this), "Not wallet");
        _;
    }
    
    modifier ownerExists(address owner) {
        require(isOwner[owner], "Not owner");
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].to != address(0), "Transaction not exists");
        _;
    }
    
    modifier confirmed(uint256 transactionId, address owner) {
        require(confirmations[transactionId][owner], "Not confirmed");
        _;
    }
    
    modifier notConfirmed(uint256 transactionId, address owner) {
        require(!confirmations[transactionId][owner], "Already confirmed");
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "Already executed");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _required) Ownable(msg.sender) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        required = _required;
    }
    
    function submitTransaction(address to, uint256 value, bytes memory data)
        public
        ownerExists(msg.sender)
        returns (uint256 transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        transactionCount += 1;
        emit SubmitTransaction(transactionId);
    }
    
    function confirmTransaction(uint256 transactionId)
        public
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].confirmations += 1;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }
    
    function executeTransaction(uint256 transactionId)
        public
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.executed = true;
            (bool success, ) = txn.to.call{value: txn.value}(txn.data);
            require(success, "Transaction failed");
            emit Execution(transactionId);
        }
    }
    
    function isConfirmed(uint256 transactionId) public view returns (bool) {
        return transactions[transactionId].confirmations >= required;
    }
    
    receive() external payable {}
}
