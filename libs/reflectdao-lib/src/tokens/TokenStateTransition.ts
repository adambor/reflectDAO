import {BtcTokenUtxo} from "./bitcoin/BitcoinWallet";
import {BigNumber} from "ethers";
import {createHash} from "crypto-browserify";
import {Payment, payments} from "bitcoinjs-lib";
import {BITCOIN_NETWORK} from "../Constants";

export type TokenStateTransitionOuput = {
    //if <0xFFFF then is treated as vout of the current commitment transaction else hash of reversedTxId + vout
    utxoHash: Buffer,
    balance: BigNumber,
    timelock: BigNumber,
    //Actually an ethereum address
    publicKey: string
};

export enum TokenStateTransitionState {
    CREATED=0,
    SENT=1,
    CONFIRMED=2,
    SYNCED=3
}

export class TokenStateTransition {

    ins: BtcTokenUtxo[];
    outs: TokenStateTransitionOuput[];
    state: TokenStateTransitionState;

    btcTx: Buffer;
    btcTxId: string;

    smartChainTxs: {
        [chainId: number]: {
            tx: any,
            txId: string,
            confirmed: boolean
        }
    } = {};

    serialize(): any {
        return {
            ins: this.ins.map(e => {
                return {
                    txId: e.txId,
                    vout: e.vout,
                    value: e.value,
                    utxoHash: e.utxoHash.toString("hex")
                }
            }),
            outs: this.outs.map(e => {
                return {
                    utxoHash: e.utxoHash.toString("hex"),
                    balance: e.balance.toHexString(),
                    timelock: e.timelock==null ? null : e.timelock.toHexString(),
                    publicKey: e.publicKey
                }
            }),
            state: this.state,
            btcTx: this.btcTx.toString("hex"),
            btcTxId: this.btcTxId,
            smartChainTxs: this.smartChainTxs
        }
    }

    static deserialize(obj: any): TokenStateTransition {
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
                balance: BigNumber.from(e.balance),
                timelock: e.timelock==null ? null : BigNumber.from(e.timelock),
                publicKey: e.publicKey
            }
        });
        const stateTransition = new TokenStateTransition(ins, outs);
        stateTransition.state = obj.state;
        stateTransition.btcTx = Buffer.from(obj.btcTx, "hex");
        stateTransition.btcTxId = obj.btcTxId;
        stateTransition.smartChainTxs = obj.smartChainTxs;
        return stateTransition;
    }

    constructor(ins: BtcTokenUtxo[], outs: TokenStateTransitionOuput[]) {
        this.ins = ins;
        this.outs = outs;
        this.state = TokenStateTransitionState.CREATED;
    }

    isTimelock(): boolean {
        let _timelock: BigNumber = null;
        for(let stateTransition of this.outs) {
            const usesOutputFromThisTx = BigNumber.from("0x"+stateTransition.utxoHash.toString("hex")).gte(BigNumber.from(0xFFFF));
            if(stateTransition.timelock==null || stateTransition.timelock.isZero()) {
                continue;
            }
            if(usesOutputFromThisTx) throw new Error("Invalid output for timelock");
            if(_timelock==null) {
                _timelock = stateTransition.timelock;
            } else {
                if(!_timelock.eq(stateTransition.timelock)) throw new Error("Timelock for all the locked inputs must be the same");
            }
        }
        return _timelock!=null;
    }

    //Returns UTXO locking script if timelocked
    getLockingScript(bitcoinPublicKey: Buffer): {
        script: Buffer,
        payment: Payment,
        addNormalOutput: boolean,
        lockedTill: BigNumber
    } {
        let _addNormalOutput: boolean = false;
        let _timelock: BigNumber = null;
        for(let stateTransition of this.outs) {
            const usesOutputFromThisTx = BigNumber.from("0x"+stateTransition.utxoHash.toString("hex")).lt(BigNumber.from(0xFFFF));
            if(stateTransition.timelock==null || stateTransition.timelock.isZero()) {
                if(usesOutputFromThisTx) _addNormalOutput = true;
                continue;
            }
            if(!usesOutputFromThisTx) throw new Error("Invalid output for timelock");
            if(_timelock==null) {
                _timelock = stateTransition.timelock;
            } else {
                if(!_timelock.eq(stateTransition.timelock)) throw new Error("Timelock for all the locked inputs must be the same");
            }
        }
        if(_timelock==null) return null;

        const paymentTarget = payments.p2wsh({
            hash: createHash("sha256").update(Buffer.concat([
                Buffer.from("04", "hex"), //OP_PUSH4
                Buffer.from(_timelock.toHexString().substring(2).padStart(8, "0"), "hex"), //timelock
                Buffer.from("b1", "hex"), //OP_CLTV
                Buffer.from("75", "hex"), //OP_DROP
                Buffer.from("21", "hex"), //OP_PUSH33
                bitcoinPublicKey, //publicKey
                Buffer.from("ad","hex") //OP_CHECKSIGVERIFY
            ])).digest(),
            network: BITCOIN_NETWORK
        });

        return {
            script: paymentTarget.output,
            payment: paymentTarget,
            addNormalOutput: _addNormalOutput,
            lockedTill: _timelock
        };
    }

    getCommitmentHash(): Buffer {
        const outputTransitionHashes = this.outs.map(e => {
            return createHash("sha256").update(Buffer.concat([
                e.utxoHash,
                Buffer.from(e.balance.toHexString().substring(2).padStart(64, "0"), "hex"),
                Buffer.from((e.timelock || BigNumber.from(0)).toHexString().substring(2).padStart(64, "0"), "hex"),
                Buffer.from((e.publicKey || "0x00").substring(2).padStart(64, "0"), "hex"),
            ])).digest();
        });
        return createHash("sha256").update(Buffer.concat(outputTransitionHashes)).digest();
    }

    missingChains(chainIds: number[]): number[] {
        const resultChainIds = [];
        for(let chainId of chainIds) {
            if(this.smartChainTxs[chainId]==null) resultChainIds.push(chainId);
        }
        return resultChainIds;
    }

    allSent(chainIds: number[]): boolean {
        for(let chainId of chainIds) {
            if(this.smartChainTxs[chainId]==null) return false;
        }
        return true;
    }

    allConfirmed(chainIds: number[]): boolean {
        for(let chainId of chainIds) {
            if(this.smartChainTxs[chainId]==null || this.smartChainTxs[chainId].confirmed) return false;
        }
        return true;
    }

}