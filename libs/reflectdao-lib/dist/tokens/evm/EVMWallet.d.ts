/// <reference types="node" />
import { BigNumber, Contract, providers } from "ethers";
import { BitcoinWallet, BtcTokenUtxo } from "../bitcoin/BitcoinWallet";
import { EVMBtcRelay, EVMBtcStoredHeader } from "./btcrelay/EVMBtcRelay";
import { TokenStateTransition } from "../TokenStateTransition";
export declare enum ProposalState {
    VOTING = 0,
    SUCCESS = 1,
    SUCCESS_CALL_FAILED = 2,
    FAILED_QUORUM = 3,
    FAILED_VOTE_NO = 4
}
export type Proposal = {
    id: number;
    createdAt: number;
    target: string;
    callData: string;
    name: string;
    description: string;
    expiry: number;
    author: string;
    voteYes: number;
    percentYes: number;
    voteNo: number;
    percentNo: number;
    totalVotes: number;
    quorumPercent: number;
    eligibleVotes: number;
    state: ProposalState;
    alreadyVoted: boolean;
    voteType: ProposalVoteType;
};
export declare enum ProposalVoteType {
    VOTE_YES = 1,
    VOTE_NO = 0
}
export type TransactionProof = {
    blockheight: BigNumber;
    txPos: BigNumber;
    merkleProof: Buffer;
    committedHeader: EVMBtcStoredHeader;
};
export declare class EVMWallet {
    static connect(chainId: number): Promise<EVMWallet>;
    chainId: number;
    provider: providers.Web3Provider;
    btcWallet: BitcoinWallet;
    governorContract: Contract;
    tokenContract: Contract;
    btcRelay: EVMBtcRelay;
    constructor(provider: providers.Web3Provider, chainId: number, bitcoinWallet: BitcoinWallet);
    init(): Promise<void>;
    getTokenBalances(utxos: BtcTokenUtxo[]): Promise<{
        lockedTokens: BigNumber;
        unlockedTokens: BigNumber;
        totalTokens: BigNumber;
    }>;
    getTokenBalance(): Promise<{
        lockedTokens: number;
        unlockedTokens: number;
        totalTokens: number;
    }>;
    getVotingPower(minExpiry?: number): Promise<number>;
    getTransactionProof(txId: string): Promise<TransactionProof>;
    proveStateTransition(stateTransition: TokenStateTransition): Promise<void>;
    getProposal(id: number, utxos?: BtcTokenUtxo[], totalVotingPower?: number): Promise<Proposal>;
    getProposals(): Promise<Proposal[]>;
    voteForProposal(proposalId: number, voteType: ProposalVoteType): Promise<string>;
}
