import { Payment } from 'bitcoinjs-lib';
type ElectrumUnspent = {
    tx_pos: number;
    value: number;
    tx_hash: string;
    height: number;
};
type ElectrumBalance = {
    confirmed: number;
    unconfirmed: number;
};
type ElectrumHistory = {
    height: number;
    tx_hash: string;
};
export type BalanceResponse = {
    address: string;
    addressRaw: Payment;
    balance: number;
    utxos: {
        vout: number;
        txId: string;
        value: number;
        script: string;
    }[];
};
export type ElectrumVin = {
    scriptSig: {
        asm: string;
        hex: string;
    };
    sequence: number;
    txid: string;
    vout: number;
};
export type ElectrumVout = {
    n: number;
    value: number;
    scriptPubKey: {
        addresses?: string[];
        address?: string;
        asm: string;
        hex: string;
        reqSigs?: number;
        type: string;
    };
};
export type ElectrumTransaction = {
    blockhash?: string;
    blocktime?: number;
    confirmations?: number;
    hash: string;
    hex: string;
    locktime: number;
    size: number;
    time?: number;
    txid: string;
    version: number;
    vin: ElectrumVin[];
    vout: ElectrumVout[];
};
export type ElectrumMerkleProof = {
    merkle: string[];
    block_height: number;
    pos: number;
};
declare class ElectrumClient {
    readonly uri: string;
    readonly reconnectDelay: number;
    private msgIdCounter;
    private readonly requests;
    private pendingRequests;
    private notificationHandlers;
    private ws;
    private isClosed;
    private messageBatch;
    private wsPinger;
    private reconnectTimeout;
    private persistentState;
    static new(uri: string, reconnectDelay?: number): Promise<ElectrumClient>;
    static stopAll(): void;
    constructor(uri: string, reconnectDelay: number);
    private flushStateTimer;
    flushPersistentState(): void;
    getTransactionMerkleProof(txId: string): Promise<ElectrumMerkleProof>;
    getTransaction(tx: string): Promise<ElectrumTransaction>;
    getTransactionHex(tx: string): Promise<string>;
    blockheaderUnsubscribe(cbk: (height: number, hex: string) => void): any;
    blockheaderSubscribe(cbk: (height: number, hex: string) => void): Promise<any>;
    addressUnsubscribe(address: Payment, cbk: (address: Payment, status: any) => void): Promise<any>;
    addressSubscribe(address: Payment, cbk: (address: string, status: any) => void): Promise<any>;
    addressSubscribeMultiple(addresses: Payment[], cbk: (address: Payment, status: any) => void): Promise<any[]>;
    getUnspent(address: Payment): Promise<ElectrumUnspent[]>;
    getBalance(address: Payment): Promise<ElectrumBalance>;
    getHistory(address: Payment): Promise<ElectrumHistory[]>;
    getBtcBalanceMultiple(addresses: Payment[], balanceOnly: boolean): Promise<BalanceResponse[]>;
    fetchFees(): Promise<number[]>;
    sendTransaction(txHex: string): Promise<any>;
    startBatch(): boolean;
    sendBatch(): boolean;
    sendRequest(method: string, params: any[]): Promise<any>;
    processServerMessage(obj: any): void;
    addWSHandlers(): void;
    resubscribe(): Promise<void>;
    connect(): void;
    init(): Promise<void>;
    close(): void;
}
export default ElectrumClient;
