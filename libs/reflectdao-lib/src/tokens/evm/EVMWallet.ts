import {CHAINS, ELECTRUM_URL} from "../../Constants";
import {BigNumber, Contract, providers, UnsignedTransaction} from "ethers";
import {BitcoinWallet, BtcTokenUtxo} from "../bitcoin/BitcoinWallet";
import {governorContractData} from "../../contracts/GovernorContractABI";
import {tokenContractData} from "../../contracts/TokenContractABI";
import {EVMBtcRelay, EVMBtcStoredHeader} from "./btcrelay/EVMBtcRelay";
import {TokenStateTransition} from "../TokenStateTransition";
import {Transaction} from "bitcoinjs-lib";
import {Utils} from "../../Utils";
import {TokenManager} from "../TokenManager";

async function switchMetamaskToChain(chain: any): Promise<boolean> {
    // @ts-ignore
    const provider = new providers.Web3Provider(window.ethereum);

    const chainId = chain.chainId;

    const res = await provider.send( 'eth_chainId', []);

    if(res===chainId) {
        return true;
    }

    try {
        await provider.send('wallet_switchEthereumChain', [{ chainId }]);
        return true;
    } catch (e: any) {
        if (e.code === 4902) {
            try {
                await provider.send('wallet_addEthereumChain', [chain]);
                return true;
            } catch (addError) {
                console.error(addError);
            }
        }
        //Metamask not installed, probably

    }
    return false;
}

async function connectToWallet(chainId: number): Promise<providers.Web3Provider> {
    // @ts-ignore
    if (window.ethereum) {
        const success = await switchMetamaskToChain(CHAINS[chainId]);
        if(!success) {
            throw new Error("Failed to switch chain");
        }

        // @ts-ignore
        const provider = new providers.Web3Provider(window.ethereum);

        await provider.send("eth_requestAccounts", []);

        return provider;
    } else {
        throw new Error("Metamask not installed");
    }
}

export enum ProposalState {
    VOTING=0,
    SUCCESS=1,
    SUCCESS_CALL_FAILED=2,
    FAILED_QUORUM=3,
    FAILED_VOTE_NO=4
}

export type Proposal = {
    id: number,
    createdAt: number,
    target: string,
    callData: string,
    name: string,
    description: string,
    expiry: number,
    author: string,

    voteYes: number,
    percentYes: number,

    voteNo: number,
    percentNo: number,

    totalVotes: number,
    quorumPercent: number,
    eligibleVotes: number,

    state: ProposalState,
    alreadyVoted: boolean,
    voteType: ProposalVoteType
};

export enum ProposalVoteType {
    VOTE_YES = 1,
    VOTE_NO = 0
}

export type TransactionProof = {
    blockheight: BigNumber,
    txPos: BigNumber,
    merkleProof: Buffer,
    committedHeader: EVMBtcStoredHeader
};

export class EVMWallet {

    static async connect(chainId: number): Promise<EVMWallet> {
        const provider = await connectToWallet(chainId);
        const btcWallet = await BitcoinWallet.getOrInitBitcoinWallet(ELECTRUM_URL);
        const evmWallet = new EVMWallet(provider, chainId, btcWallet);
        await evmWallet.init();
        return evmWallet;
    }

    chainId: number;
    provider: providers.Web3Provider;
    btcWallet: BitcoinWallet;

    governorContract: Contract;
    tokenContract: Contract;
    btcRelay: EVMBtcRelay;

    constructor(provider: providers.Web3Provider, chainId: number, bitcoinWallet: BitcoinWallet) {
        this.provider = provider;
        this.btcWallet = bitcoinWallet;
        this.chainId = chainId;

        this.governorContract = new Contract(CHAINS[chainId]._contracts.governor, governorContractData.abi, provider.getSigner());
        this.tokenContract = new Contract(CHAINS[chainId]._contracts.token, tokenContractData.abi, provider.getSigner());
        this.btcRelay = new EVMBtcRelay(provider, CHAINS[chainId]._contracts.btcRelay);
    }

    init(): Promise<void> {
        return this.btcWallet.init();
    }

    async getTokenBalances(utxos: BtcTokenUtxo[]): Promise<{
        lockedTokens: BigNumber,
        unlockedTokens: BigNumber,
        totalTokens: BigNumber
    }> {
        const result = await this.tokenContract.getTokens(utxos.map(e => "0x"+e.utxoHash.toString("hex")));

        return {
            lockedTokens: result.locked,
            unlockedTokens: result.unlocked,
            totalTokens: result.locked.add(result.unlocked),
        }
    }

    async getTokenBalance(): Promise<{
        lockedTokens: number,
        unlockedTokens: number,
        totalTokens: number
    }> {
        const utxos = await this.btcWallet.getUtxos();
        const result = await this.tokenContract.getTokens(utxos.map(e => "0x"+e.utxoHash.toString("hex")));

        return {
            lockedTokens: result.locked.toNumber(),
            unlockedTokens: result.unlocked.toNumber(),
            totalTokens: result.locked.add(result.unlocked).toNumber(),
        }
    }

    async getVotingPower(minExpiry?: number): Promise<number> {
        const utxos = await this.btcWallet.getUtxos();
        const address = await this.provider.getSigner().getAddress();
        console.log("Utxos: ", utxos);
        console.log("Address: ", address);
        return (await this.governorContract.getVotingPowerNoRevert(
            address,
            utxos.map(e => "0x"+e.utxoHash.toString("hex")),
            minExpiry || Math.floor(Date.now()/1000)
        )).toNumber();
    }

    async getTransactionProof(txId: string): Promise<TransactionProof> {
        const tx = await this.btcWallet.electrumClient.getTransaction(txId);
        const merkleProof = await this.btcWallet.electrumClient.getTransactionMerkleProof(txId);
        const committedHeaderResp = await this.btcRelay.retrieveLogAndBlockheight({
            blockhash: tx.blockhash,
            height: merkleProof.block_height
        });
        return {
            blockheight: BigNumber.from(merkleProof.block_height),
            txPos: BigNumber.from(merkleProof.pos),
            merkleProof: Buffer.concat(
                merkleProof.merkle.map(e => Buffer.from(e, "hex").reverse())
            ),
            committedHeader: committedHeaderResp.header
        }
    }

    async proveStateTransition(stateTransition: TokenStateTransition) {

        const ins: BigNumber[] = [];
        for(let i=0;i<stateTransition.ins.length;i++) {
            ins.push(BigNumber.from(i)); //Every input is a state transition input for now
        }

        const outs = stateTransition.outs.map(e => {
            return {
                utxoHash: "0x"+e.utxoHash.toString("hex"),
                balance: e.balance,
                timelock: e.timelock==null ? BigNumber.from(0) : e.timelock,
                publicKey: e.publicKey==null ? "0x0000000000000000000000000000000000000000" : e.publicKey
            }
        });

        let buff = Buffer.alloc(0);

        if(stateTransition.isTimelock()) {
            buff = this.btcWallet.publicKey;
        }

        //Strip the witness data
        const strippedTx = Utils.stripWitnessData(stateTransition.btcTx);
        const proof = await this.getTransactionProof(stateTransition.btcTxId);

        const unsignedTx: UnsignedTransaction = await this.tokenContract.populateTransaction.transact(
            "0x"+strippedTx.toString("hex"),
            ins,
            outs,
            "0x"+buff.toString("hex"),
            proof
        );

        unsignedTx.gasLimit = BigNumber.from(150000);

        const receipt = await this.provider.getSigner().sendTransaction(unsignedTx);

        stateTransition.smartChainTxs[this.chainId] = {
            tx: receipt.raw,
            txId: receipt.hash,
            confirmed: false
        };
        TokenManager.save();

        await receipt.wait(1);

        stateTransition.smartChainTxs[this.chainId].confirmed = true;
        TokenManager.save();

    }

    async getProposal(id: number, utxos?: BtcTokenUtxo[], totalVotingPower?: number): Promise<Proposal> {

        if(utxos==null) utxos = await this.btcWallet.getUtxos();
        if(totalVotingPower==null) totalVotingPower = (await this.tokenContract.getTotalVotingPower()).toNumber();

        const proposal = await this.governorContract.getProposal(BigNumber.from(id));
        const alreadyVoteType: BigNumber = await this.governorContract.getVoteType(utxos.map(e => "0x"+e.utxoHash.toString("hex")), BigNumber.from(id));

        console.log(proposal);

        const totalVotesYes = proposal.votes[1].toNumber();
        const totalVotesNo = proposal.votes[0].toNumber();
        const totalVotes = totalVotesYes+totalVotesNo;

        return {
            id: id,
            createdAt: proposal.createdAt.toNumber(),
            target: proposal.target,
            callData: proposal.callData,
            name: Buffer.from(proposal.name.substring(2), "hex").toString(),
            description: Buffer.from(proposal.description.substring(2), "hex").toString(),
            expiry: proposal.expiry.toNumber(),
            author: proposal.author,
            voteNo: totalVotesNo,
            percentNo: totalVotes==0 ? 0 : totalVotesNo/totalVotes*100,
            voteYes: totalVotesYes,
            percentYes: totalVotes==0 ? 0 : totalVotesYes/totalVotes*100,
            totalVotes,
            eligibleVotes: totalVotingPower,
            quorumPercent: totalVotes/totalVotingPower*100,
            state: proposal.state.toNumber(),
            alreadyVoted: !alreadyVoteType.isZero(),
            voteType: alreadyVoteType.toNumber()>0 ? (
                alreadyVoteType.toNumber()===1 ? ProposalVoteType.VOTE_NO : ProposalVoteType.VOTE_YES
            ) : null
        };

    }

    async getProposals(): Promise<Proposal[]> {
        const proposalCount: BigNumber = await this.governorContract._proposalCount();
        const proposals: Proposal[] = [];

        const totalVotingPower: BigNumber = await this.tokenContract.getTotalVotingPower();

        const utxos = await this.btcWallet.getUtxos();

        for(let i=0;i<proposalCount.toNumber();i++) {
            proposals.push(await this.getProposal(i, utxos, totalVotingPower.toNumber()));
        }

        return proposals;
    }

    async voteForProposal(proposalId: number, voteType: ProposalVoteType) {
        const lockedUtxos: BtcTokenUtxo[] = await this.btcWallet.getLockedUtxos();

        const voteTx: UnsignedTransaction = await this.governorContract.populateTransaction.vote(
            BigNumber.from(proposalId),
            lockedUtxos.map(e => "0x"+e.utxoHash.toString("hex")),
            BigNumber.from(voteType)
        );

        voteTx.gasLimit = BigNumber.from(150000);

        const receipt = await this.provider.getSigner().sendTransaction(voteTx);

        await receipt.wait(1);

        return receipt.hash;
    }

}