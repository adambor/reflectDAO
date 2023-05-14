import * as bip32 from 'bip32';
import { BIP32Interface } from 'bip32';
import {Payment, payments, Psbt, ECPair} from "bitcoinjs-lib";
import {BITCOIN_NETWORK} from '../../Constants';
import * as bip39 from "bip39";
import ElectrumClient from "./ElectrumClient";

import {createHash} from "crypto-browserify";
import {TokenStateTransition, TokenStateTransitionState} from "../TokenStateTransition";
import {TokenManager} from '../TokenManager';

export type BtcTokenUtxo = {
    txId: string,
    vout: number,
    value: number,
    utxoHash: Buffer,
    locked: boolean,
    lockedTill: number
}

const bip32Path = "m/84'/0'/0'/0/0";

const TX_EMPTY_SIZE = 4 /*version*/ + 1 /*in count*/ + 1 /*out count*/ + 4 /*locktime*/;
const WITNESS_OVERHEAD = (2 /*marker and flag*/)/4;
const BASE_TX_SIZE = TX_EMPTY_SIZE + WITNESS_OVERHEAD;

const P2WPKH_WITNESS = (1/*pushes*/+1/*push sig*/+72+1/*push pubkey*/+33)/4;
const P2WPKH_TX_INPUT = 32 /*prev tx id*/ + 4 /*prev vout*/ + 1 /*script len*/ + 4 /*sequence*/ + P2WPKH_WITNESS;

const TX_OUTPUT_BASE = 8 /*amount*/ + 1 /*script len*/;
const TX_OUTPUT_P2WPKH = TX_OUTPUT_BASE + 22;
const TX_OUTPUT_P2WSH = TX_OUTPUT_BASE + 34;
const TX_OUTPUT_OP_RETURN = TX_OUTPUT_BASE + 34;

export class BitcoinWallet {

    root: BIP32Interface;
    publicKey: Buffer;
    address: Payment;

    electrumUrl: string;
    electrumClient: ElectrumClient;

    constructor(seed: Buffer, electrumUrl: string) {
        this.root = bip32.fromSeed(seed, BITCOIN_NETWORK);
        this.publicKey = this.root.derivePath(bip32Path).publicKey;
        this.address = payments.p2wpkh({
            pubkey: this.publicKey,
            network: BITCOIN_NETWORK
        });
        this.electrumUrl = electrumUrl;
    }

    async init(): Promise<void> {
        this.electrumClient = await ElectrumClient.new(this.electrumUrl);
    }

    async getLockedUtxos(): Promise<BtcTokenUtxo[]> {
        const result: BtcTokenUtxo[] = [];

        const promises = [];
        for(let tokenTransition of TokenManager.stateTransitions) {
            const resp = tokenTransition.getLockingScript(this.publicKey);
            if(resp!=null) {
                promises.push(this.electrumClient.getUnspent(resp.payment).then(res => {
                    res.forEach(e => {
                        const voutBuff = Buffer.alloc(32);
                        voutBuff.writeUInt32BE(e.tx_pos, 28);
                        result.push({
                            txId: e.tx_hash,
                            vout: e.tx_pos,
                            value: e.value,
                            utxoHash: createHash("sha256").update(Buffer.concat([
                                Buffer.from(e.tx_hash, "hex").reverse(),
                                voutBuff
                            ])).digest(),
                            locked: true,
                            lockedTill: resp.lockedTill.toNumber()
                        });
                    });
                }))
            }
        }

        await Promise.all(promises);

        return result;
    }

    async getUnlockedUtxos(): Promise<BtcTokenUtxo[]> {
        const utxos = await this.electrumClient.getUnspent(this.address);

        return utxos.map(e => {
            const voutBuff = Buffer.alloc(32);
            voutBuff.writeUInt32BE(e.tx_pos, 28);
            return {
                txId: e.tx_hash,
                vout: e.tx_pos,
                value: e.value,
                utxoHash: createHash("sha256").update(Buffer.concat([
                    Buffer.from(e.tx_hash, "hex").reverse(),
                    voutBuff
                ])).digest(),
                locked: false,
                lockedTill: 0
            };
        });
    }

    async getUtxos(): Promise<BtcTokenUtxo[]> {
        const utxos = await this.electrumClient.getUnspent(this.address);

        const result: BtcTokenUtxo[] = [];

        utxos.forEach(e => {
            const voutBuff = Buffer.alloc(32);
            voutBuff.writeUInt32BE(e.tx_pos, 28);
            const buff = Buffer.concat([
                Buffer.from(e.tx_hash, "hex").reverse(),
                voutBuff
            ]);
            const utxoHash = createHash("sha256").update(buff).digest();
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
        for(let tokenTransition of TokenManager.stateTransitions) {
            const resp = tokenTransition.getLockingScript(this.publicKey);
            console.log("Locking script response: ", resp);
            if(resp!=null) {
                promises.push(this.electrumClient.getUnspent(resp.payment).then(res => {
                    res.forEach(e => {
                        const voutBuff = Buffer.alloc(32);
                        voutBuff.writeUInt32BE(e.tx_pos, 28);
                        const buff = Buffer.concat([
                            Buffer.from(e.tx_hash, "hex").reverse(),
                            voutBuff
                        ]);
                        const utxoHash = createHash("sha256").update(buff).digest();
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
                }))
            }
        }

        await Promise.all(promises);

        console.log("Utxos: ", result);

        return result;
    }

    async commitStateTransition(tokenStateTransition: TokenStateTransition): Promise<string> {

        let totalValue = 0;
        tokenStateTransition.ins.forEach(e => {
            totalValue += e.value
        });

        //Locking input first
        const resp = tokenStateTransition.getLockingScript(this.publicKey);

        let txvBytes = BASE_TX_SIZE + (P2WPKH_TX_INPUT*tokenStateTransition.ins.length) + TX_OUTPUT_OP_RETURN + TX_OUTPUT_P2WPKH;
        if(resp!=null) txvBytes += TX_OUTPUT_P2WSH;
        const feeRate = await this.electrumClient.fetchFees();
        const estimatedFee = Math.ceil(feeRate[0]*txvBytes);

        console.log("Tx fee: ", estimatedFee);

        let outputValue = totalValue-estimatedFee;

        let psbt = new Psbt({
            network: BITCOIN_NETWORK
        });

        tokenStateTransition.ins.forEach(input =>
            psbt.addInput({
                hash: input.txId,
                index: input.vout,
                witnessUtxo: {
                    script: this.address.output,
                    value: input.value
                }
            })
        );

        if(resp!=null) {
            psbt.addOutput({
                script: resp.script,
                value: 546
            });
            outputValue -= 546;
        }

        if(resp==null || resp.addNormalOutput) {
            if(outputValue<546) throw new Error("Output too small");
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

        let keypair = ECPair.fromPrivateKey(this.root.derivePath(bip32Path).privateKey);
        for(let i=0;i<tokenStateTransition.ins.length;i++) {
            psbt.signInput(i, keypair);
        }

        psbt.finalizeAllInputs();

        const tx = psbt.extractTransaction();

        const txHash = tx.getId();

        tokenStateTransition.btcTxId = txHash;
        tokenStateTransition.btcTx = tx.toBuffer();
        tokenStateTransition.state = TokenStateTransitionState.SENT;

        TokenManager.stateTransitions.push(tokenStateTransition);
        TokenManager.save();

        await this.electrumClient.sendTransaction(tx.toHex());

        return txHash;

    }

    static generateMnemonic(): string[] {
        return bip39.generateMnemonic().split(" ");
    }

    static async mnemonicToSeed(mnemonicArr: string[]): Promise<Buffer> {
        const mnemonic = mnemonicArr.join(" ");

        if(!bip39.validateMnemonic(mnemonic)) {
            return null;
        }

        const seed = await bip39.mnemonicToSeed(mnemonic);

        return seed;
    }

    static async getOrInitBitcoinWallet(electrumUrl: string): Promise<BitcoinWallet> {
        let storedSeed = localStorage.getItem("btc-seed");
        if(storedSeed==null) {
            const seed = await BitcoinWallet.mnemonicToSeed(BitcoinWallet.generateMnemonic());
            storedSeed = seed.toString("hex");
            localStorage.setItem("btc-seed", storedSeed);
        }
        return new BitcoinWallet(Buffer.from(storedSeed, "hex"), electrumUrl);
    }

}