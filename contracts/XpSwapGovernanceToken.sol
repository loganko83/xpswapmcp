// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title XpSwapGovernanceToken
 * @dev 거버넌스 투표를 위한 ERC20 토큰
 */
contract XpSwapGovernanceToken is ERC20, ERC20Votes, ERC20Permit, Ownable, Pausable {
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
        mapping(address => VoteChoice) votes;
    }
    
    enum VoteChoice { For, Against, Abstain }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    uint256 public votingDelay = 1 days;
    uint256 public votingPeriod = 7 days;
    uint256 public proposalThreshold = 1000 * 10**18; // 1000 tokens required to propose
    uint256 public quorumNumerator = 4; // 4% quorum
    uint256 public quorumDenominator = 100;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        VoteChoice choice,
        uint256 votes,
        string reason
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _owner
    ) 
        ERC20(_name, _symbol)
        ERC20Permit(_name)
        Ownable(_owner)
    {
        _mint(_owner, _initialSupply);
    }
    
    /**
     * @dev 새 제안 생성
     */
    function propose(
        string memory _title,
        string memory _description
    ) external whenNotPaused returns (uint256) {
        require(getVotes(msg.sender) >= proposalThreshold, "Insufficient voting power");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = ++proposalCount;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp + votingDelay;
        newProposal.endTime = newProposal.startTime + votingPeriod;
        newProposal.executed = false;
        newProposal.canceled = false;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            _title,
            newProposal.startTime,
            newProposal.endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev 제안에 투표
     */
    function castVote(
        uint256 _proposalId,
        VoteChoice _choice
    ) external whenNotPaused {
        _castVote(_proposalId, msg.sender, _choice, "");
    }
    
    /**
     * @dev 이유와 함께 투표
     */
    function castVoteWithReason(
        uint256 _proposalId,
        VoteChoice _choice,
        string memory _reason
    ) external whenNotPaused {
        _castVote(_proposalId, msg.sender, _choice, _reason);
    }
    
    /**
     * @dev 서명을 통한 투표
     */
    function castVoteBySig(
        uint256 _proposalId,
        VoteChoice _choice,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external whenNotPaused {
        bytes32 domainSeparator = _domainSeparatorV4();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Vote(uint256 proposalId,uint8 choice,uint256 nonce,uint256 deadline)"),
                _proposalId,
                uint8(_choice),
                _useNonce(msg.sender),
                block.timestamp
            )
        );
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, _v, _r, _s);
        
        _castVote(_proposalId, signer, _choice, "");
    }
    
    /**
     * @dev 내부 투표 함수
     */
    function _castVote(
        uint256 _proposalId,
        address _voter,
        VoteChoice _choice,
        string memory _reason
    ) internal {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime, "Voting has not started");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(!proposal.hasVoted[_voter], "Already voted");
        
        uint256 votes = getVotes(_voter);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[_voter] = true;
        proposal.votes[_voter] = _choice;
        
        if (_choice == VoteChoice.For) {
            proposal.forVotes += votes;
        } else if (_choice == VoteChoice.Against) {
            proposal.againstVotes += votes;
        } else {
            proposal.abstainVotes += votes;
        }
        
        emit VoteCast(_voter, _proposalId, _choice, votes, _reason);
    }
    
    /**
     * @dev 제안 실행
     */
    function executeProposal(uint256 _proposalId) external {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        // Check if proposal passed
        require(_quorumReached(_proposalId), "Quorum not reached");
        require(_voteSucceeded(_proposalId), "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId);
    }
    
    /**
     * @dev 제안 취소 (제안자만)
     */
    function cancelProposal(uint256 _proposalId) external {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(_proposalId);
    }
    
    /**
     * @dev 쿼럼 달성 여부 확인
     */
    function _quorumReached(uint256 _proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = getPastTotalSupply(proposal.startTime);
        
        return totalVotes >= (totalSupply * quorumNumerator) / quorumDenominator;
    }
    
    /**
     * @dev 투표 성공 여부 확인
     */
    function _voteSucceeded(uint256 _proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.forVotes > proposal.againstVotes;
    }
    
    /**
     * @dev 제안 상태 확인
     */
    function getProposalState(uint256 _proposalId) external view returns (string memory) {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.canceled) {
            return "Canceled";
        }
        
        if (proposal.executed) {
            return "Executed";
        }
        
        if (block.timestamp < proposal.startTime) {
            return "Pending";
        }
        
        if (block.timestamp <= proposal.endTime) {
            return "Active";
        }
        
        if (_quorumReached(_proposalId) && _voteSucceeded(_proposalId)) {
            return "Succeeded";
        }
        
        return "Defeated";
    }
    
    /**
     * @dev 제안 정보 조회
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool canceled
    ) {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.canceled
        );
    }
    
    /**
     * @dev 사용자 투표 확인
     */
    function getUserVote(uint256 _proposalId, address _user) external view returns (bool hasVoted, VoteChoice choice) {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        hasVoted = proposal.hasVoted[_user];
        choice = proposal.votes[_user];
    }
    
    // Owner functions
    function setVotingDelay(uint256 _newVotingDelay) external onlyOwner {
        votingDelay = _newVotingDelay;
    }
    
    function setVotingPeriod(uint256 _newVotingPeriod) external onlyOwner {
        votingPeriod = _newVotingPeriod;
    }
    
    function setProposalThreshold(uint256 _newThreshold) external onlyOwner {
        proposalThreshold = _newThreshold;
    }
    
    function setQuorum(uint256 _numerator, uint256 _denominator) external onlyOwner {
        require(_denominator > 0, "Denominator cannot be zero");
        require(_numerator <= _denominator, "Numerator cannot exceed denominator");
        
        quorumNumerator = _numerator;
        quorumDenominator = _denominator;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Required overrides
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
    
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
