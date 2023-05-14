"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStateTransition = exports.TokenStateTransitionState = void 0;
const ethers_1 = require("ethers");
const crypto_browserify_1 = require("crypto-browserify");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const Constants_1 = require("../Constants");
var TokenStateTransitionState;
(function (TokenStateTransitionState) {
    TokenStateTransitionState[TokenStateTransitionState["CREATED"] = 0] = "CREATED";
    TokenStateTransitionState[TokenStateTransitionState["SENT"] = 1] = "SENT";
    TokenStateTransitionState[TokenStateTransitionState["CONFIRMED"] = 2] = "CONFIRMED";
    TokenStateTransitionState[TokenStateTransitionState["SYNCED"] = 3] = "SYNCED";
})(TokenStateTransitionState = exports.TokenStateTransitionState || (exports.TokenStateTransitionState = {}));
class TokenStateTransition {
    serialize() {
        return {
            ins: this.ins.map(e => {
                return {
                    txId: e.txId,
                    vout: e.vout,
                    value: e.value,
                    utxoHash: e.utxoHash.toString("hex")
                };
            }),
            outs: this.outs.map(e => {
                return {
                    utxoHash: e.utxoHash.toString("hex"),
                    balance: e.balance.toHexString(),
                    timelock: e.timelock == null ? null : e.timelock.toHexString(),
                    publicKey: e.publicKey
                };
            }),
            state: this.state,
            btcTx: this.btcTx.toString("hex"),
            btcTxId: this.btcTxId,
            smartChainTxs: this.smartChainTxs
        };
    }
    static deserialize(obj) {
        const ins = obj.ins.map(e => {
            return {
                txId: e.txId,
                vout: e.vout,
                value: e.value,
                utxoHash: Buffer.from(e.utxoHash, "hex")
            };
        });
        const outs = obj.outs.map(e => {
            return {
                utxoHash: Buffer.from(e.utxoHash, "hex"),
                balance: ethers_1.BigNumber.from(e.balance),
                timelock: e.timelock == null ? null : ethers_1.BigNumber.from(e.timelock),
                publicKey: e.publicKey
            };
        });
        const stateTransition = new TokenStateTransition(ins, outs);
        stateTransition.state = obj.state;
        stateTransition.btcTx = Buffer.from(obj.btcTx, "hex");
        stateTransition.btcTxId = obj.btcTxId;
        stateTransition.smartChainTxs = obj.smartChainTxs;
        return stateTransition;
    }
    constructor(ins, outs) {
        this.smartChainTxs = {};
        this.ins = ins;
        this.outs = outs;
        this.state = TokenStateTransitionState.CREATED;
    }
    isTimelock() {
        let _timelock = null;
        for (let stateTransition of this.outs) {
            const usesOutputFromThisTx = ethers_1.BigNumber.from("0x" + stateTransition.utxoHash.toString("hex")).gte(ethers_1.BigNumber.from(0xFFFF));
            if (stateTransition.timelock == null || stateTransition.timelock.isZero()) {
                continue;
            }
            if (usesOutputFromThisTx)
                throw new Error("Invalid output for timelock");
            if (_timelock == null) {
                _timelock = stateTransition.timelock;
            }
            else {
                if (!_timelock.eq(stateTransition.timelock))
                    throw new Error("Timelock for all the locked inputs must be the same");
            }
        }
        return _timelock != null;
    }
    //Returns UTXO locking script if timelocked
    getLockingScript(bitcoinPublicKey) {
        let _addNormalOutput = false;
        let _timelock = null;
        for (let stateTransition of this.outs) {
            const usesOutputFromThisTx = ethers_1.BigNumber.from("0x" + stateTransition.utxoHash.toString("hex")).lt(ethers_1.BigNumber.from(0xFFFF));
            if (stateTransition.timelock == null || stateTransition.timelock.isZero()) {
                if (usesOutputFromThisTx)
                    _addNormalOutput = true;
                continue;
            }
            if (!usesOutputFromThisTx)
                throw new Error("Invalid output for timelock");
            if (_timelock == null) {
                _timelock = stateTransition.timelock;
            }
            else {
                if (!_timelock.eq(stateTransition.timelock))
                    throw new Error("Timelock for all the locked inputs must be the same");
            }
        }
        if (_timelock == null)
            return null;
        const paymentTarget = bitcoinjs_lib_1.payments.p2wsh({
            hash: (0, crypto_browserify_1.createHash)("sha256").update(Buffer.concat([
                Buffer.from("04", "hex"),
                Buffer.from(_timelock.toHexString().substring(2).padStart(8, "0"), "hex"),
                Buffer.from("b1", "hex"),
                Buffer.from("75", "hex"),
                Buffer.from("21", "hex"),
                bitcoinPublicKey,
                Buffer.from("ad", "hex") //OP_CHECKSIGVERIFY
            ])).digest(),
            network: Constants_1.BITCOIN_NETWORK
        });
        return {
            script: paymentTarget.output,
            payment: paymentTarget,
            addNormalOutput: _addNormalOutput,
            lockedTill: _timelock
        };
    }
    getCommitmentHash() {
        const outputTransitionHashes = this.outs.map(e => {
            return (0, crypto_browserify_1.createHash)("sha256").update(Buffer.concat([
                e.utxoHash,
                Buffer.from(e.balance.toHexString().substring(2).padStart(64, "0"), "hex"),
                Buffer.from((e.timelock || ethers_1.BigNumber.from(0)).toHexString().substring(2).padStart(64, "0"), "hex"),
                Buffer.from((e.publicKey || "0x00").substring(2).padStart(64, "0"), "hex"),
            ])).digest();
        });
        return (0, crypto_browserify_1.createHash)("sha256").update(Buffer.concat(outputTransitionHashes)).digest();
    }
    missingChains(chainIds) {
        const resultChainIds = [];
        for (let chainId of chainIds) {
            if (this.smartChainTxs[chainId] == null)
                resultChainIds.push(chainId);
        }
        return resultChainIds;
    }
    allSent(chainIds) {
        for (let chainId of chainIds) {
            if (this.smartChainTxs[chainId] == null)
                return false;
        }
        return true;
    }
    allConfirmed(chainIds) {
        for (let chainId of chainIds) {
            if (this.smartChainTxs[chainId] == null || this.smartChainTxs[chainId].confirmed)
                return false;
        }
        return true;
    }
}
exports.TokenStateTransition = TokenStateTransition;
