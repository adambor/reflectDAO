/// <reference types="node" />
import { BtcTokenUtxo } from "./bitcoin/BitcoinWallet";
import { BigNumber } from "ethers";
import { Payment } from "bitcoinjs-lib";
export type TokenStateTransitionOuput = {
    utxoHash: Buffer;
    balance: BigNumber;
    timelock: BigNumber;
    publicKey: string;
};
export declare enum TokenStateTransitionState {
    CREATED = 0,
    SENT = 1,
    CONFIRMED = 2,
    SYNCED = 3
}
export declare class TokenStateTransition {
    ins: BtcTokenUtxo[];
    outs: TokenStateTransitionOuput[];
    state: TokenStateTransitionState;
    btcTx: Buffer;
    btcTxId: string;
    smartChainTxs: {
        [chainId: number]: {
            tx: any;
            txId: string;
            confirmed: boolean;
        };
    };
    serialize(): any;
    static deserialize(obj: any): TokenStateTransition;
    constructor(ins: BtcTokenUtxo[], outs: TokenStateTransitionOuput[]);
    isTimelock(): boolean;
    getLockingScript(bitcoinPublicKey: Buffer): {
        script: Buffer;
        payment: Payment;
        addNormalOutput: boolean;
        lockedTill: BigNumber;
    };
    getCommitmentHash(): Buffer;
    missingChains(chainIds: number[]): number[];
    allSent(chainIds: number[]): boolean;
    allConfirmed(chainIds: number[]): boolean;
}
