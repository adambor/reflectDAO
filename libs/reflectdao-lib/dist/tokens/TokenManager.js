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
exports.TokenManager = void 0;
const ethers_1 = require("ethers");
const TokenStateTransition_1 = require("./TokenStateTransition");
const Constants_1 = require("../Constants");
class TokenManager {
    static load() {
        let storedJson = localStorage.getItem("state-transitions");
        if (storedJson == null) {
            storedJson = "[]";
        }
        const storedObject = JSON.parse(storedJson);
        this.stateTransitions = storedObject.map(e => TokenStateTransition_1.TokenStateTransition.deserialize(e));
    }
    static save() {
        localStorage.setItem("state-transitions", JSON.stringify(this.stateTransitions.map(e => e.serialize())));
    }
    constructor(evmWallet) {
        this.btcWallet = evmWallet.btcWallet;
        this.evmWallet = evmWallet;
    }
    verifyStateTransitions() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let stateTransition of TokenManager.stateTransitions) {
                if (stateTransition.state === TokenStateTransition_1.TokenStateTransitionState.CONFIRMED || TokenStateTransition_1.TokenStateTransitionState.SENT) {
                    if (stateTransition.btcTxId != null) {
                        //Check if already confirmed
                        const txResult = yield this.btcWallet.electrumClient.getTransaction(stateTransition.btcTxId);
                        if (txResult != null) {
                            if (txResult.confirmations >= Constants_1.CONFIRMATIONS_REQUIRED) {
                                stateTransition.state = TokenStateTransition_1.TokenStateTransitionState.CONFIRMED;
                            }
                            else {
                                stateTransition.state = TokenStateTransition_1.TokenStateTransitionState.SENT;
                            }
                        }
                        else {
                            stateTransition.state = TokenStateTransition_1.TokenStateTransitionState.CREATED;
                        }
                    }
                }
                if (stateTransition.state === TokenStateTransition_1.TokenStateTransitionState.CONFIRMED) {
                    //Check if confirmed on the smart chain
                    const chainStatus = stateTransition.smartChainTxs[this.evmWallet.chainId];
                    if (chainStatus != null) {
                        if (!stateTransition.smartChainTxs[this.evmWallet.chainId].confirmed) {
                            const receipt = yield this.evmWallet.provider.getTransactionReceipt(chainStatus.txId);
                            if (receipt == null || !receipt.status) {
                                delete stateTransition.smartChainTxs[this.evmWallet.chainId];
                            }
                            else {
                                //Successfully confirmed
                                chainStatus.confirmed = true;
                            }
                        }
                        if (chainStatus.confirmed) {
                            //Check if it's confirmed on all chains
                            const isAllConfirmed = stateTransition.allConfirmed(Object.keys(Constants_1.CHAINS).map(e => parseInt(e)));
                            if (isAllConfirmed) {
                                stateTransition.state = TokenStateTransition_1.TokenStateTransitionState.SYNCED;
                            }
                        }
                    }
                }
            }
            TokenManager.save();
        });
    }
    createSendStateTransition(_recipientUtxoHash, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (_recipientUtxoHash.length != 64)
                throw new Error("Invalid length of UTXO hash");
            const recipientUtxoHash = Buffer.from(_recipientUtxoHash, "hex");
            const unlockedUtxos = yield this.btcWallet.getUnlockedUtxos();
            const balances = yield this.evmWallet.getTokenBalances(unlockedUtxos);
            const change = balances.unlockedTokens.sub(ethers_1.BigNumber.from(amount));
            if (change.lt(ethers_1.BigNumber.from(0)))
                throw new Error("Sending more tokens than owned");
            const stateTransitionOutputs = [];
            stateTransitionOutputs.push({
                utxoHash: recipientUtxoHash,
                balance: ethers_1.BigNumber.from(amount),
                timelock: null,
                publicKey: null
            });
            if (!change.isZero()) {
                //Add state transition to self
                stateTransitionOutputs.push({
                    utxoHash: Buffer.alloc(32, 0),
                    balance: change,
                    timelock: null,
                    publicKey: null
                });
            }
            return new TokenStateTransition_1.TokenStateTransition(unlockedUtxos, stateTransitionOutputs);
        });
    }
    createLockStateTransition(expiryInDays, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield this.evmWallet.provider.getSigner().getAddress();
            const timeLock = ethers_1.BigNumber.from(Math.floor((Date.now() + (expiryInDays * 24 * 60 * 60 * 1000)) / 1000));
            const unlockedUtxos = yield this.btcWallet.getUnlockedUtxos();
            const balances = yield this.evmWallet.getTokenBalances(unlockedUtxos);
            const change = balances.unlockedTokens.sub(ethers_1.BigNumber.from(amount));
            if (change.lt(ethers_1.BigNumber.from(0)))
                throw new Error("Locking more tokens than owned");
            const stateTransitionOutputs = [];
            stateTransitionOutputs.push({
                utxoHash: Buffer.alloc(32, 0),
                balance: ethers_1.BigNumber.from(amount),
                timelock: timeLock,
                publicKey: address
            });
            if (!change.isZero()) {
                //Add change state transition to self
                stateTransitionOutputs.push({
                    utxoHash: Buffer.from("0000000000000000000000000000000000000000000000000000000000000001", "hex"),
                    balance: change,
                    timelock: null,
                    publicKey: null
                });
            }
            return new TokenStateTransition_1.TokenStateTransition(unlockedUtxos, stateTransitionOutputs);
        });
    }
}
exports.TokenManager = TokenManager;
