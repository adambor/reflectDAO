import "./CrossChainDAO.sol";

contract GovernorDao {

    uint8 public constant VOTE_YES = 1;
    uint8 public constant VOTE_NO = 0;

    uint256 public constant STATE_VOTING = 0;
    uint256 public constant STATE_SUCCESS = 1;
    uint256 public constant STATE_SUCCESS_CALL_FAILED = 2;
    uint256 public constant STATE_FAILED_QUORUM = 3;
    uint256 public constant STATE_FAILED_VOTE_NO = 4;

    uint256 public constant MIN_VOTING_PERIOD = 14 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public constant MIN_QUORUM_PPM = 1000;
    uint256 public constant MIN_VOTING_POWER_PROPOSAL = 1;

    struct ProposalRequest {    
        address target;
        bytes callData;
        bytes name;
        bytes description;
        uint256 expiry;
    }

    struct Proposal {
        uint256 createdAt;
        address target;
        bytes callData;
        bytes name;
        bytes description;
        uint256 expiry;
        address author;
        uint256[2] votes;
        uint256 state;
        mapping(bytes32 => uint256) voters;
    }

    struct ProposalResponse {
        uint256 createdAt;
        address target;
        bytes callData;
        bytes name;
        bytes description;
        uint256 expiry;
        address author;
        uint256[2] votes;
        uint256 state;
    }

    event ProposalCreated(uint256 indexed proposalIndex, address indexed proposer, ProposalRequest proposal);
    event ProposalVote(uint256 indexed proposalIndex, address indexed voter, bytes32 indexed utxoHash, uint8 voteType);
    event ProposalSuccess(uint256 indexed proposalIndex, bytes executionResponse, bool executionSuccess);
    event ProposalFailed(uint256 indexed proposalIndex);

    uint256 public _proposalCount;
    mapping(uint256 => Proposal) public _proposals;

    CrossChainDAO immutable _tokens;

    constructor(CrossChainDAO tokens) {
        _tokens = tokens;
    }
    
    function getVoteType(bytes32[] calldata utxoHashes, uint256 proposalId) public view returns (uint256) {
        for(uint256 i=0;i<utxoHashes.length;i++) {
            if(_proposals[proposalId].voters[utxoHashes[i]]>0) return _proposals[proposalId].voters[utxoHashes[i]];
        }
        return 0;
    }

    function alreadyVoted(bytes32[] calldata utxoHashes, uint256 proposalId) public view returns (bool) {
        for(uint256 i=0;i<utxoHashes.length;i++) {
            if(_proposals[proposalId].voters[utxoHashes[i]]>0) return true;
        }
        return false;
    }

    function getProposal(uint256 proposalId) public view returns (ProposalResponse memory) {
        return ProposalResponse(
            _proposals[proposalId].createdAt,
            _proposals[proposalId].target,
            _proposals[proposalId].callData,
            _proposals[proposalId].name,
            _proposals[proposalId].description,
            _proposals[proposalId].expiry,
            _proposals[proposalId].author,
            _proposals[proposalId].votes,
            _proposals[proposalId].state
        );
    }

    function getMinVotingPeriod() public view returns (uint256) {
        return MIN_VOTING_PERIOD;
    }

    function getMaxVotingPeriod() public view returns (uint256) {
        return MAX_VOTING_PERIOD;
    }

    function getMinQuorum() public view returns (uint256) {
        return MIN_QUORUM_PPM;
    }

    function getMinVotingPowerForProposal() public view returns (uint256) {
        return MIN_VOTING_POWER_PROPOSAL;
    }

    function getVotingPowerNoRevert(address owner, bytes32[] calldata utxoHashes, uint256 minExpiry) public view returns (uint256) {
        uint256 totalVotingPower;
        for(uint256 i=0;i<utxoHashes.length;i++) {
            totalVotingPower += _tokens.getVotingPowerNoRevert(owner, utxoHashes[i], minExpiry);
        }
        return totalVotingPower;
    }

    function getVotingPower(address owner, bytes32[] calldata utxoHashes, uint256 minExpiry) public view returns (uint256) {
        uint256 totalVotingPower;
        for(uint256 i=0;i<utxoHashes.length;i++) {
            totalVotingPower += _tokens.getVotingPower(owner, utxoHashes[i], minExpiry);
        }
        return totalVotingPower;
    }

    function submitProposal(
        ProposalRequest calldata proposal,
        bytes32[] calldata utxoHashes
    ) public {
        require(proposal.expiry>=block.timestamp+MIN_VOTING_PERIOD, "Min voting period");
        require(proposal.expiry<=block.timestamp+MAX_VOTING_PERIOD, "Max voting period");

        uint256 totalVotingPower;
        for(uint256 i=0;i<utxoHashes.length;i++) {
            totalVotingPower += _tokens.getVotingPower(msg.sender, utxoHashes[i], proposal.expiry);
        }

        uint256 sharePPM = totalVotingPower*1000000/_tokens.getTotalVotingPower();

        require(sharePPM>=MIN_VOTING_POWER_PROPOSAL, "Min voting power");

        uint256 proposalIndex = _proposalCount;
        _proposalCount++;

        _proposals[proposalIndex].createdAt = block.timestamp;
        _proposals[proposalIndex].target = proposal.target;
        _proposals[proposalIndex].callData = proposal.callData;
        _proposals[proposalIndex].name = proposal.name;
        _proposals[proposalIndex].description = proposal.description;
        _proposals[proposalIndex].expiry = proposal.expiry;
        _proposals[proposalIndex].author = msg.sender;

        emit ProposalCreated(proposalIndex, msg.sender, proposal);
    }

    function vote(
        uint256 proposalIndex,
        bytes32[] calldata utxoHashes,
        uint8 voteType
    ) public {
        require(_proposals[proposalIndex].expiry>block.timestamp, "Voting over");
        require(voteType<2, "Invalid vote type");

        uint256 totalVotingPower;
        for(uint256 i=0;i<utxoHashes.length;i++) {
            bytes32 utxoHash = utxoHashes[i];
            require(_proposals[proposalIndex].voters[utxoHash]==0, "Already voted");
            totalVotingPower += _tokens.getVotingPower(msg.sender, utxoHash, _proposals[proposalIndex].expiry);
        }

        _proposals[proposalIndex].votes[voteType] += totalVotingPower;

        for(uint256 i=0;i<utxoHashes.length;i++) {
            bytes32 utxoHash = utxoHashes[i];
            _proposals[proposalIndex].voters[utxoHash] = 1+voteType;
            emit ProposalVote(proposalIndex, msg.sender, utxoHash, voteType);
        }
    }

    function execute(
        uint256 proposalIndex
    ) public {
        require(_proposals[proposalIndex].expiry<=block.timestamp, "Not matured yet");
        
        uint256 votesYes = _proposals[proposalIndex].votes[VOTE_YES];
        uint256 votesNo = _proposals[proposalIndex].votes[VOTE_NO];
        if(votesYes>votesNo) {
            uint256 votePPM = votesYes*1000000/_tokens.getTotalVotingPower();
            if(votePPM>=MIN_QUORUM_PPM) {
                //Success
                (bool result, bytes memory res) = _proposals[proposalIndex].target.call(_proposals[proposalIndex].callData);
                emit ProposalSuccess(proposalIndex, res, result);
                if(result) {
                    _proposals[proposalIndex].state = STATE_SUCCESS;
                } else {
                    _proposals[proposalIndex].state = STATE_SUCCESS_CALL_FAILED;
                }
            } else {
                _proposals[proposalIndex].state = STATE_FAILED_QUORUM;
                emit ProposalFailed(proposalIndex);
            }
        } else {
            _proposals[proposalIndex].state = STATE_FAILED_VOTE_NO;
            emit ProposalFailed(proposalIndex);
        }
    }

}