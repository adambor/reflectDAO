import { networks } from "bitcoinjs-lib";
export declare const BITCOIN_NETWORK: networks.Network;
export declare const ELECTRUM_URL = "wss://node3.gethopa.com:50002/";
export declare const CONFIRMATIONS_REQUIRED = 1;
export declare const CHAIN_LINEA_TESTNET = 59140;
export declare const CHAIN_GNOSIS_TESTNET = 10200;
export declare const CHAINS: {
    59140: {
        chainId: string;
        chainName: string;
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
        blockExplorerUrls: string[];
        rpcUrls: string[];
        _contracts: {
            token: string;
            governor: string;
            btcRelay: string;
        };
    };
    10200: {
        chainId: string;
        chainName: string;
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
        blockExplorerUrls: string[];
        rpcUrls: string[];
        _contracts: {
            token: string;
            governor: string;
            btcRelay: string;
        };
    };
};
