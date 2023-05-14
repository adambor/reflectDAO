import {networks} from "bitcoinjs-lib";

export const BITCOIN_NETWORK = networks.testnet;

export const ELECTRUM_URL = "wss://node3.gethopa.com:50002/";

export const CONFIRMATIONS_REQUIRED = 1;

export const CHAIN_LINEA_TESTNET = 59140;
export const CHAIN_GNOSIS_TESTNET = 10200;

export const CHAINS = {
    59140: {
        chainId: "0x"+(59140).toString(16),
        chainName: "Linea goerli testnet",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        },
        blockExplorerUrls: ["https://explorer.goerli.linea.build"],
        rpcUrls: ["https://rpc.goerli.linea.build"],

        _contracts: {
            token: "0x4C1eED85318765ab4a6570d6b4aA8cfb366C2520",
            governor: "0x03A5f5264c02B14f9F83ec834a9403FC7e6A48bE",
            btcRelay: "0x2Ac1341d5C63bB8A7b6a0f3521D0d61852B849B6",
        }
    },
    10200: {
        chainId: "0x"+(10200).toString(16),
        chainName: "Gnosis Chiado (Testnet)",
        nativeCurrency: {
            name: "GNO",
            symbol: "GNO",
            decimals: 18
        },
        blockExplorerUrls: ["https://blockscout.com/gnosis/chiado"],
        rpcUrls: ["https://rpc.chiadochain.net"],

        _contracts: {
            token: "0x6493b00c9C9E50180bcfB96Ad58A843044FB4d15",
            governor: "0xE8a7C121091Cc9aB52A396D8B1e738561E16765d",
            btcRelay: "0x31fC856da0BE97d4cFF40157a5f7f695FC14A239",
        }
    }
};