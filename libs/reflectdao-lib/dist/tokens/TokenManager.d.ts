import { BitcoinWallet } from "./bitcoin/BitcoinWallet";
import { EVMWallet } from "./evm/EVMWallet";
import { TokenStateTransition } from "./TokenStateTransition";
export declare class TokenManager {
    btcWallet: BitcoinWallet;
    evmWallet: EVMWallet;
    static stateTransitions: TokenStateTransition[];
    static load(): void;
    static save(): void;
    constructor(evmWallet: EVMWallet);
    verifyStateTransitions(): Promise<void>;
    createSendStateTransition(_recipientUtxoHash: string, amount: number): Promise<TokenStateTransition>;
    createLockStateTransition(expiryInDays: number, amount: number): Promise<TokenStateTransition>;
}
