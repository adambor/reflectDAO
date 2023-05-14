"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMSigner = void 0;
const EVMSigner_1 = require("crosslightning-evm/dist/evm/signer/EVMSigner");
const privKey = process.env.EVM_PRIVKEY;
const address = process.env.EVM_ADDRESS;
const rpcUrl = process.env.EVM_RPC_URL;
const networkId = parseInt(process.env.EVM_CHAIN_ID);
exports.EVMSigner = new EVMSigner_1.EVMWallet(privKey, rpcUrl, networkId, "storage/wallet");
