"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtcRPCConfig = void 0;
exports.BtcRPCConfig = {
    protocol: process.env.BTC_PROTOCOL,
    user: process.env.BTC_RPC_USERNAME,
    pass: process.env.BTC_RPC_PASSWORD,
    host: process.env.BTC_NODE_HOST,
    port: parseInt(process.env.BTC_PORT),
};
