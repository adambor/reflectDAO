/// <reference types="node" />
import { BIP32Interface } from 'bip32';
import { Payment } from "bitcoinjs-lib";
import ElectrumClient from "./ElectrumClient";
import { TokenStateTransition } from "../TokenStateTransition";
export type BtcTokenUtxo = {
    txId: string;
    vout: number;
    value: number;
    utxoHash: Buffer;
    locked: boolean;
    lockedTill: number;
};
export declare class BitcoinWallet {
    root: BIP32Interface;
    publicKey: Buffer;
    address: Payment;
    electrumUrl: string;
    electrumClient: ElectrumClient;
    constructor(seed: Buffer, electrumUrl: string);
    init(): Promise<void>;
    getLockedUtxos(): Promise<BtcTokenUtxo[]>;
    getUnlockedUtxos(): Promise<BtcTokenUtxo[]>;
    getUtxos(): Promise<BtcTokenUtxo[]>;
    commitStateTransition(tokenStateTransition: TokenStateTransition): Promise<string>;
    static generateMnemonic(): string[];
    static mnemonicToSeed(mnemonicArr: string[]): Promise<Buffer>;
    static getOrInitBitcoinWallet(electrumUrl: string): Promise<BitcoinWallet>;
}
