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
exports.BitcoinWallet = void 0;
const bip32 = require("bip32");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const Constants_1 = require("../../Constants");
const bip39 = require("bip39");
const ElectrumClient_1 = require("./ElectrumClient");
const crypto_browserify_1 = require("crypto-browserify");
const TokenStateTransition_1 = require("../TokenStateTransition");
const TokenManager_1 = require("../TokenManager");
const bip32Path = "m/84'/0'/0'/0/0";
const TX_EMPTY_SIZE = 4 /*version*/ + 1 /*in count*/ + 1 /*out count*/ + 4 /*locktime*/;
const WITNESS_OVERHEAD = (2 /*marker and flag*/) / 4;
const BASE_TX_SIZE = TX_EMPTY_SIZE + WITNESS_OVERHEAD;
const P2WPKH_WITNESS = (1 /*pushes*/ + 1 /*push sig*/ + 72 + 1 /*push pubkey*/ + 33) / 4;
const P2WPKH_TX_INPUT = 32 /*prev tx id*/ + 4 /*prev vout*/ + 1 /*script len*/ + 4 /*sequence*/ + P2WPKH_WITNESS;
const TX_OUTPUT_BASE = 8 /*amount*/ + 1 /*script len*/;
const TX_OUTPUT_P2WPKH = TX_OUTPUT_BASE + 22;
const TX_OUTPUT_P2WSH = TX_OUTPUT_BASE + 34;
const TX_OUTPUT_OP_RETURN = TX_OUTPUT_BASE + 34;
class BitcoinWallet {
    constructor(seed, electrumUrl) {
        this.root = bip32.fromSeed(seed, Constants_1.BITCOIN_NETWORK);
        this.publicKey = this.root.derivePath(bip32Path).publicKey;
        this.address = bitcoinjs_lib_1.payments.p2wpkh({
            pubkey: this.publicKey,
            network: Constants_1.BITCOIN_NETWORK
        });
        this.electrumUrl = electrumUrl;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.electrumClient = yield ElectrumClient_1.default.new(this.electrumUrl);
        });
    }
    getLockedUtxos() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const promises = [];
            for (let tokenTransition of TokenManager_1.TokenManager.stateTransitions) {
                const resp = tokenTransition.getLockingScript(this.publicKey);
                if (resp != null) {
                    promises.push(this.electrumClient.getUnspent(resp.payment).then(res => {
                        res.forEach(e => {
                            const voutBuff = Buffer.alloc(32);
                            voutBuff.writeUInt32BE(e.tx_pos, 28);
                            result.push({
                                txId: e.tx_hash,
                                vout: e.tx_pos,
                                value: e.value,
                                utxoHash: (0, crypto_browserify_1.createHash)("sha256").update(Buffer.concat([
                                    Buffer.from(e.tx_hash, "hex").reverse(),
                                    voutBuff
                                ])).digest(),
                                locked: true,
                                lockedTill: resp.lockedTill.toNumber()
                            });
                        });
                    }));
                }
            }
            yield Promise.all(promises);
            return result;
        });
    }
    getUnlockedUtxos() {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield this.electrumClient.getUnspent(this.address);
            return utxos.map(e => {
                const voutBuff = Buffer.alloc(32);
                voutBuff.writeUInt32BE(e.tx_pos, 28);
                return {
                    txId: e.tx_hash,
                    vout: e.tx_pos,
                    value: e.value,
                    utxoHash: (0, crypto_browserify_1.createHash)("sha256").update(Buffer.concat([
                        Buffer.from(e.tx_hash, "hex").reverse(),
                        voutBuff
                    ])).digest(),
                    locked: false,
                    lockedTill: 0
                };
            });
        });
    }
    getUtxos() {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield this.electrumClient.getUnspent(this.address);
            const result = [];
            utxos.forEach(e => {
                const voutBuff = Buffer.alloc(32);
                voutBuff.writeUInt32BE(e.tx_pos, 28);
                const buff = Buffer.concat([
                    Buffer.from(e.tx_hash, "hex").reverse(),
                    voutBuff
                ]);
                const utxoHash = (0, crypto_browserify_1.createHash)("sha256").update(buff).digest();
                console.log("buffer: ", buff.toString('hex'));
                console.log("hash: ", utxoHash.toString("hex"));
                result.push({
                    txId: e.tx_hash,
                    vout: e.tx_pos,
                    value: e.value,
                    utxoHash: utxoHash,
                    locked: false,
                    lockedTill: 0
                });
            });
            const promises = [];
            for (let tokenTransition of TokenManager_1.TokenManager.stateTransitions) {
                const resp = tokenTransition.getLockingScript(this.publicKey);
                console.log("Locking script response: ", resp);
                if (resp != null) {
                    promises.push(this.electrumClient.getUnspent(resp.payment).then(res => {
                        res.forEach(e => {
                            const voutBuff = Buffer.alloc(32);
                            voutBuff.writeUInt32BE(e.tx_pos, 28);
                            const buff = Buffer.concat([
                                Buffer.from(e.tx_hash, "hex").reverse(),
                                voutBuff
                            ]);
                            const utxoHash = (0, crypto_browserify_1.createHash)("sha256").update(buff).digest();
                            console.log("buffer: ", buff.toString('hex'));
                            console.log("hash: ", utxoHash.toString("hex"));
                            result.push({
                                txId: e.tx_hash,
                                vout: e.tx_pos,
                                value: e.value,
                                utxoHash: utxoHash,
                                locked: true,
                                lockedTill: resp.lockedTill.toNumber()
                            });
                        });
                    }));
                }
            }
            yield Promise.all(promises);
            console.log("Utxos: ", result);
            return result;
        });
    }
    commitStateTransition(tokenStateTransition) {
        return __awaiter(this, void 0, void 0, function* () {
            let totalValue = 0;
            tokenStateTransition.ins.forEach(e => {
                totalValue += e.value;
            });
            //Locking input first
            const resp = tokenStateTransition.getLockingScript(this.publicKey);
            let txvBytes = BASE_TX_SIZE + (P2WPKH_TX_INPUT * tokenStateTransition.ins.length) + TX_OUTPUT_OP_RETURN + TX_OUTPUT_P2WPKH;
            if (resp != null)
                txvBytes += TX_OUTPUT_P2WSH;
            const feeRate = yield this.electrumClient.fetchFees();
            const estimatedFee = Math.ceil(feeRate[0] * txvBytes);
            console.log("Tx fee: ", estimatedFee);
            let outputValue = totalValue - estimatedFee;
            let psbt = new bitcoinjs_lib_1.Psbt({
                network: Constants_1.BITCOIN_NETWORK
            });
            tokenStateTransition.ins.forEach(input => psbt.addInput({
                hash: input.txId,
                index: input.vout,
                witnessUtxo: {
                    script: this.address.output,
                    value: input.value
                }
            }));
            if (resp != null) {
                psbt.addOutput({
                    script: resp.script,
                    value: 546
                });
                outputValue -= 546;
            }
            if (resp == null || resp.addNormalOutput) {
                if (outputValue < 546)
                    throw new Error("Output too small");
                psbt.addOutput({
                    address: this.address.address,
                    value: outputValue
                });
            }
            psbt.addOutput({
                script: Buffer.concat([
                    Buffer.from("6a20", "hex"),
                    tokenStateTransition.getCommitmentHash()
                ]),
                value: 0
            });
            let keypair = bitcoinjs_lib_1.ECPair.fromPrivateKey(this.root.derivePath(bip32Path).privateKey);
            for (let i = 0; i < tokenStateTransition.ins.length; i++) {
                psbt.signInput(i, keypair);
            }
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const txHash = tx.getId();
            tokenStateTransition.btcTxId = txHash;
            tokenStateTransition.btcTx = tx.toBuffer();
            tokenStateTransition.state = TokenStateTransition_1.TokenStateTransitionState.SENT;
            TokenManager_1.TokenManager.stateTransitions.push(tokenStateTransition);
            TokenManager_1.TokenManager.save();
            yield this.electrumClient.sendTransaction(tx.toHex());
            return txHash;
        });
    }
    static generateMnemonic() {
        return bip39.generateMnemonic().split(" ");
    }
    static mnemonicToSeed(mnemonicArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = mnemonicArr.join(" ");
            if (!bip39.validateMnemonic(mnemonic)) {
                return null;
            }
            const seed = yield bip39.mnemonicToSeed(mnemonic);
            return seed;
        });
    }
    static getOrInitBitcoinWallet(electrumUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let storedSeed = localStorage.getItem("btc-seed");
            if (storedSeed == null) {
                const seed = yield BitcoinWallet.mnemonicToSeed(BitcoinWallet.generateMnemonic());
                storedSeed = seed.toString("hex");
                localStorage.setItem("btc-seed", storedSeed);
            }
            return new BitcoinWallet(Buffer.from(storedSeed, "hex"), electrumUrl);
        });
    }
}
exports.BitcoinWallet = BitcoinWallet;
