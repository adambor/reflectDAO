"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenContractData = void 0;
exports.tokenContractData = {
    abi: [
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "genesisMerkleRoot",
                    "type": "bytes32"
                },
                {
                    "internalType": "contract BTCRelay",
                    "name": "btcRelay",
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
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "data",
                    "type": "bytes32"
                }
            ],
            "name": "UtxoCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "data",
                    "type": "bytes32"
                }
            ],
            "name": "UtxoSpent",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "_data",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "_genesisMerkleRoot",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
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
            "name": "_genesisSpent",
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
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "vin",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "position",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "merkleProof",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.GenesisUtxoState",
                    "name": "utxoState",
                    "type": "tuple"
                }
            ],
            "name": "getGenesisHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "result",
                    "type": "bytes32"
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
                            "internalType": "bytes32",
                            "name": "utxoHash",
                            "type": "bytes32"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.UtxoStateTransitionOutput[]",
                    "name": "newStates",
                    "type": "tuple[]"
                }
            ],
            "name": "getStateTransitionCommitHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "result",
                    "type": "bytes32"
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
                }
            ],
            "name": "getTokens",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "locked",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "unlocked",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTotalVotingPower",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "votingPower",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "txData",
                    "type": "bytes"
                }
            ],
            "name": "getTransactionData",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "reversedTxId",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "opReturnCommitHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "vinUtxoHashes",
                    "type": "bytes32[]"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "outputScriptHashes",
                    "type": "bytes32[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "reversedTxId",
                    "type": "bytes32"
                },
                {
                    "internalType": "uint256",
                    "name": "vout",
                    "type": "uint256"
                }
            ],
            "name": "getUtxoHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "result",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
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
                    "name": "votingPower",
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
                    "name": "voter",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
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
                    "name": "votingPower",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "utxoHash",
                    "type": "bytes32"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.UtxoState",
                    "name": "utxoState",
                    "type": "tuple"
                }
            ],
            "name": "saveCommitment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "transactionData",
                    "type": "bytes"
                },
                {
                    "internalType": "uint256[]",
                    "name": "ins",
                    "type": "uint256[]"
                },
                {
                    "components": [
                        {
                            "internalType": "bytes32",
                            "name": "utxoHash",
                            "type": "bytes32"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.UtxoStateTransitionOutput[]",
                    "name": "outs",
                    "type": "tuple[]"
                },
                {
                    "internalType": "bytes",
                    "name": "outPublicKeys",
                    "type": "bytes"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "blockheight",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "txPos",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "merkleProof",
                            "type": "bytes"
                        },
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "chainWork",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes32",
                                    "name": "reversedPrevBlockHash",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "bytes32",
                                    "name": "merkleRoot",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "data1",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "data2",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct BTCRelay.HeaderInfo",
                            "name": "committedHeader",
                            "type": "tuple"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.TransactionProof",
                    "name": "proof",
                    "type": "tuple"
                }
            ],
            "name": "transact",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "transactionData",
                    "type": "bytes"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "vin",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "position",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "merkleProof",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.GenesisUtxoState[]",
                    "name": "ins",
                    "type": "tuple[]"
                },
                {
                    "components": [
                        {
                            "internalType": "bytes32",
                            "name": "utxoHash",
                            "type": "bytes32"
                        },
                        {
                            "internalType": "uint256",
                            "name": "balance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timelock",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "publicKey",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.UtxoStateTransitionOutput[]",
                    "name": "outs",
                    "type": "tuple[]"
                },
                {
                    "internalType": "bytes",
                    "name": "outPublicKeys",
                    "type": "bytes"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "blockheight",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "txPos",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "merkleProof",
                            "type": "bytes"
                        },
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "chainWork",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes32",
                                    "name": "reversedPrevBlockHash",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "bytes32",
                                    "name": "merkleRoot",
                                    "type": "bytes32"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "data1",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "data2",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct BTCRelay.HeaderInfo",
                            "name": "committedHeader",
                            "type": "tuple"
                        }
                    ],
                    "internalType": "struct CrossChainDAO.TransactionProof",
                    "name": "proof",
                    "type": "tuple"
                }
            ],
            "name": "transactGenesis",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};
