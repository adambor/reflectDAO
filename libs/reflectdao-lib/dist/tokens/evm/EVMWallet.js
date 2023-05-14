"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMWallet = exports.ProposalVoteType = exports.ProposalState = void 0;
const Constants_1 = require("../../Constants");
const ethers_1 = require("ethers");
const BitcoinWallet_1 = require("../bitcoin/BitcoinWallet");
const GovernorContractABI_1 = require("../../contracts/GovernorContractABI");
const TokenContractABI_1 = require("../../contracts/TokenContractABI");
const EVMBtcRelay_1 = require("./btcrelay/EVMBtcRelay");
const Utils_1 = require("../../Utils");
const TokenManager_1 = require("../TokenManager");
function switchMetamaskToChain(chain) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const provider = new ethers_1.providers.Web3Provider(window.ethereum);
        const chainId = chain.chainId;
        const res = yield provider.send('eth_chainId', []);
        if (res === chainId) {
            return true;
        }
        try {
            yield provider.send('wallet_switchEthereumChain', [{ chainId }]);
            return true;
        }
        catch (e) {
            if (e.code === 4902) {
                try {
                    yield provider.send('wallet_addEthereumChain', [chain]);
                    return true;
                }
                catch (addError) {
                    console.error(addError);
                }
            }
            //Metamask not installed, probably
        }
        return false;
    });
}
function connectToWallet(chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        if (window.ethereum) {
            const success = yield switchMetamaskToChain(Constants_1.CHAINS[chainId]);
            if (!success) {
                throw new Error("Failed to switch chain");
            }
            // @ts-ignore
            const provider = new ethers_1.providers.Web3Provider(window.ethereum);
            yield provider.send("eth_requestAccounts", []);
            return provider;
        }
        else {
            throw new Error("Metamask not installed");
        }
    });
}
var ProposalState;
(function (ProposalState) {
    ProposalState[ProposalState["VOTING"] = 0] = "VOTING";
    ProposalState[ProposalState["SUCCESS"] = 1] = "SUCCESS";
    ProposalState[ProposalState["SUCCESS_CALL_FAILED"] = 2] = "SUCCESS_CALL_FAILED";
    ProposalState[ProposalState["FAILED_QUORUM"] = 3] = "FAILED_QUORUM";
    ProposalState[ProposalState["FAILED_VOTE_NO"] = 4] = "FAILED_VOTE_NO";
})(ProposalState = exports.ProposalState || (exports.ProposalState = {}));
var ProposalVoteType;
(function (ProposalVoteType) {
    ProposalVoteType[ProposalVoteType["VOTE_YES"] = 1] = "VOTE_YES";
    ProposalVoteType[ProposalVoteType["VOTE_NO"] = 0] = "VOTE_NO";
})(ProposalVoteType = exports.ProposalVoteType || (exports.ProposalVoteType = {}));
class EVMWallet {
    static connect(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield connectToWallet(chainId);
            const btcWallet = yield BitcoinWallet_1.BitcoinWallet.getOrInitBitcoinWallet(Constants_1.ELECTRUM_URL);
            const evmWallet = new EVMWallet(provider, chainId, btcWallet);
            yield evmWallet.init();
            return evmWallet;
        });
    }
    constructor(provider, chainId, bitcoinWallet) {
        this.provider = provider;
        this.btcWallet = bitcoinWallet;
        this.chainId = chainId;
        this.governorContract = new ethers_1.Contract(Constants_1.CHAINS[chainId]._contracts.governor, GovernorContractABI_1.governorContractData.abi, provider.getSigner());
        this.tokenContract = new ethers_1.Contract(Constants_1.CHAINS[chainId]._contracts.token, TokenContractABI_1.tokenContractData.abi, provider.getSigner());
        this.btcRelay = new EVMBtcRelay_1.EVMBtcRelay(provider, Constants_1.CHAINS[chainId]._contracts.btcRelay);
    }
    init() {
        return this.btcWallet.init();
    }
    getTokenBalances(utxos) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.tokenContract.getTokens(utxos.map(e => "0x" + e.utxoHash.toString("hex")));
            return {
                lockedTokens: result.locked,
                unlockedTokens: result.unlocked,
                totalTokens: result.locked.add(result.unlocked),
            };
        });
    }
    getTokenBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield this.btcWallet.getUtxos();
            const result = yield this.tokenContract.getTokens(utxos.map(e => "0x" + e.utxoHash.toString("hex")));
            return {
                lockedTokens: result.locked.toNumber(),
                unlockedTokens: result.unlocked.toNumber(),
                totalTokens: result.locked.add(result.unlocked).toNumber(),
            };
        });
    }
    getVotingPower(minExpiry) {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield this.btcWallet.getUtxos();
            const address = yield this.provider.getSigner().getAddress();
            console.log("Utxos: ", utxos);
            console.log("Address: ", address);
            return (yield this.governorContract.getVotingPowerNoRevert(address, utxos.map(e => "0x" + e.utxoHash.toString("hex")), minExpiry || Math.floor(Date.now() / 1000))).toNumber();
        });
    }
    getTransactionProof(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.btcWallet.electrumClient.getTransaction(txId);
            const merkleProof = yield this.btcWallet.electrumClient.getTransactionMerkleProof(txId);
            const committedHeaderResp = yield this.btcRelay.retrieveLogAndBlockheight({
                blockhash: tx.blockhash,
                height: merkleProof.block_height
            });
            return {
                blockheight: ethers_1.BigNumber.from(merkleProof.block_height),
                txPos: ethers_1.BigNumber.from(merkleProof.pos),
                merkleProof: Buffer.concat(merkleProof.merkle.map(e => Buffer.from(e, "hex").reverse())),
                committedHeader: committedHeaderResp.header
            };
        });
    }
    proveStateTransition(stateTransition) {
        return __awaiter(this, void 0, void 0, function* () {
            const ins = [];
            for (let i = 0; i < stateTransition.ins.length; i++) {
                ins.push(ethers_1.BigNumber.from(i)); //Every input is a state transition input for now
            }
            const outs = stateTransition.outs.map(e => {
                return {
                    utxoHash: "0x" + e.utxoHash.toString("hex"),
                    balance: e.balance,
                    timelock: e.timelock == null ? ethers_1.BigNumber.from(0) : e.timelock,
                    publicKey: e.publicKey == null ? "0x0000000000000000000000000000000000000000" : e.publicKey
                };
            });
            let buff = Buffer.alloc(0);
            if (stateTransition.isTimelock()) {
                buff = this.btcWallet.publicKey;
            }
            //Strip the witness data
            const strippedTx = Utils_1.Utils.stripWitnessData(stateTransition.btcTx);
            const proof = yield this.getTransactionProof(stateTransition.btcTxId);
            const unsignedTx = yield this.tokenContract.populateTransaction.transact("0x" + strippedTx.toString("hex"), ins, outs, "0x" + buff.toString("hex"), proof);
            unsignedTx.gasLimit = ethers_1.BigNumber.from(150000);
            const receipt = yield this.provider.getSigner().sendTransaction(unsignedTx);
            stateTransition.smartChainTxs[this.chainId] = {
                tx: receipt.raw,
                txId: receipt.hash,
                confirmed: false
            };
            TokenManager_1.TokenManager.save();
            yield receipt.wait(1);
            stateTransition.smartChainTxs[this.chainId].confirmed = true;
            TokenManager_1.TokenManager.save();
        });
    }
    getProposal(id, utxos, totalVotingPower) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utxos == null)
                utxos = yield this.btcWallet.getUtxos();
            if (totalVotingPower == null)
                totalVotingPower = (yield this.tokenContract.getTotalVotingPower()).toNumber();
            const proposal = yield this.governorContract.getProposal(ethers_1.BigNumber.from(id));
            const alreadyVoteType = yield this.governorContract.getVoteType(utxos.map(e => "0x" + e.utxoHash.toString("hex")), ethers_1.BigNumber.from(id));
            console.log(proposal);
            const totalVotesYes = proposal.votes[1].toNumber();
            const totalVotesNo = proposal.votes[0].toNumber();
            const totalVotes = totalVotesYes + totalVotesNo;
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
                percentNo: totalVotes == 0 ? 0 : totalVotesNo / totalVotes * 100,
                voteYes: totalVotesYes,
                percentYes: totalVotes == 0 ? 0 : totalVotesYes / totalVotes * 100,
                totalVotes,
                eligibleVotes: totalVotingPower,
                quorumPercent: totalVotes / totalVotingPower * 100,
                state: proposal.state.toNumber(),
                alreadyVoted: !alreadyVoteType.isZero(),
                voteType: alreadyVoteType.toNumber() > 0 ? (alreadyVoteType.toNumber() === 1 ? ProposalVoteType.VOTE_NO : ProposalVoteType.VOTE_YES) : null
            };
        });
    }
    getProposals() {
        return __awaiter(this, void 0, void 0, function* () {
            const proposalCount = yield this.governorContract._proposalCount();
            const proposals = [];
            const totalVotingPower = yield this.tokenContract.getTotalVotingPower();
            const utxos = yield this.btcWallet.getUtxos();
            for (let i = 0; i < proposalCount.toNumber(); i++) {
                proposals.push(yield this.getProposal(i, utxos, totalVotingPower.toNumber()));
            }
            return proposals;
        });
    }
    voteForProposal(proposalId, voteType) {
        return __awaiter(this, void 0, void 0, function* () {
            const lockedUtxos = yield this.btcWallet.getLockedUtxos();
            const voteTx = yield this.governorContract.populateTransaction.vote(ethers_1.BigNumber.from(proposalId), lockedUtxos.map(e => "0x" + e.utxoHash.toString("hex")), ethers_1.BigNumber.from(voteType));
            voteTx.gasLimit = ethers_1.BigNumber.from(150000);
            const receipt = yield this.provider.getSigner().sendTransaction(voteTx);
            yield receipt.wait(1);
            return receipt.hash;
        });
    }
}
exports.EVMWallet = EVMWallet;
