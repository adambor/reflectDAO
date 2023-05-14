"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.governorContractData = void 0;
exports.governorContractData = {
    abi: [
        {
            "inputs": [
                {
                    "internalType": "contract CrossChainDAO",
                    "name": "tokens",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "proposer",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "name",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "description",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint256",
                            "name": "expiry",
                            "type": "uint256"
                        }
                    ],
                    "indexed": false,
                    "internalType": "struct GovernorDao.ProposalRequest",
                    "name": "proposal",
                    "type": "tuple"
                }
            ],
            "name": "ProposalCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                }
            ],
            "name": "ProposalFailed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "bytes",
                    "name": "executionResponse",
                    "type": "bytes"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "executionSuccess",
                    "type": "bool"
                }
            ],
            "name": "ProposalSuccess",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "uint8",
                    "name": "voteType",
                    "type": "uint8"
                }
            ],
            "name": "ProposalVote",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "MAX_VOTING_PERIOD",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MIN_QUORUM_PPM",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MIN_VOTING_PERIOD",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "MIN_VOTING_POWER_PROPOSAL",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "STATE_FAILED_QUORUM",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "STATE_FAILED_VOTE_NO",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "STATE_SUCCESS",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "STATE_SUCCESS_CALL_FAILED",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "STATE_VOTING",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "VOTE_NO",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "VOTE_YES",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "_proposalCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "_proposals",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "createdAt",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "target",
                    "type": "address"
                },
                {
                    "internalType": "bytes",
                    "name": "callData",
                    "type": "bytes"
                },
                {
                    "internalType": "bytes",
                    "name": "name",
                    "type": "bytes"
                },
                {
                    "internalType": "bytes",
                    "name": "description",
                    "type": "bytes"
                },
                {
                    "internalType": "uint256",
                    "name": "expiry",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "author",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "state",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                }
            ],
            "name": "alreadyVoted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                }
            ],
            "name": "execute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMaxVotingPeriod",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMinQuorum",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMinVotingPeriod",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getMinVotingPowerForProposal",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                }
            ],
            "name": "getProposal",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "createdAt",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "name",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "description",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint256",
                            "name": "expiry",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "author",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256[2]",
                            "name": "votes",
                            "type": "uint256[2]"
                        },
                        {
                            "internalType": "uint256",
                            "name": "state",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct GovernorDao.ProposalResponse",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint256",
                    "name": "proposalId",
                    "type": "uint256"
                }
            ],
            "name": "getVoteType",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint256",
                    "name": "minExpiry",
                    "type": "uint256"
                }
            ],
            "name": "getVotingPower",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint256",
                    "name": "minExpiry",
                    "type": "uint256"
                }
            ],
            "name": "getVotingPowerNoRevert",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "name",
                            "type": "bytes"
                        },
                        {
                            "internalType": "bytes",
                            "name": "description",
                            "type": "bytes"
                        },
                        {
                            "internalType": "uint256",
                            "name": "expiry",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct GovernorDao.ProposalRequest",
                    "name": "proposal",
                    "type": "tuple"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                }
            ],
            "name": "submitProposal",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "proposalIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "utxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "uint8",
                    "name": "voteType",
                    "type": "uint8"
                }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};
