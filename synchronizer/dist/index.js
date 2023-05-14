"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const EVMSigner_1 = require("./evm/EVMSigner");
const fs = require("fs/promises");
const zeromq_1 = require("zeromq");
const crosslightning_evm_1 = require("crosslightning-evm");
const BtcRPC_1 = require("./btc/BtcRPC");
const btcrelay_bitcoind_1 = require("btcrelay-bitcoind");
async function syncToLatest(synchronizer) {
    console.log("[Main]: Syncing to latest...");
    const resp = await synchronizer.syncToLatestTxs();
    for (let key in resp.computedHeaderMap) {
        const computedHeader = resp.computedHeaderMap[key];
        console.log("Computed header, height: " + key + ": ", {
            chainWork: computedHeader.chainWork.toHexString(),
            reversedPrevBlockHash: computedHeader.reversedPrevBlockHash,
            merkleRoot: computedHeader.merkleRoot,
            data1: computedHeader.data1.toHexString(),
            data2: computedHeader.data2.toHexString(),
        });
    }
    const totalTxs = resp.txs;
    //TODO: Figure out some recovery here, since all relayers will be publishing blookheaders and claiming swaps
    let signature;
    for (let i = 0; i < totalTxs.length; i++) {
        const tx = totalTxs[i];
        console.log("[Main]: Sending tx: ", i);
        signature = await EVMSigner_1.EVMSigner.sendTransaction(tx);
        console.log("[Main]: TX sent: ", signature);
    }
    if (signature != null) {
        await EVMSigner_1.EVMSigner.provider.waitForTransaction(signature.hash);
    }
    console.log("[Main]: All txs confirmed!");
}
async function main() {
    var _a, e_1, _b, _c;
    try {
        await fs.mkdir("storage");
    }
    catch (e) { }
    await EVMSigner_1.EVMSigner.init();
    const bitcoinRpc = new btcrelay_bitcoind_1.BitcoindRpc(BtcRPC_1.BtcRPCConfig.protocol, BtcRPC_1.BtcRPCConfig.user, BtcRPC_1.BtcRPCConfig.pass, BtcRPC_1.BtcRPCConfig.host, BtcRPC_1.BtcRPCConfig.port);
    const btcRelay = new crosslightning_evm_1.EVMBtcRelay(EVMSigner_1.EVMSigner, bitcoinRpc, process.env.EVM_BTC_RELAY_CONTRACT_ADDRESS);
    const synchronizer = new btcrelay_bitcoind_1.BtcRelaySynchronizer(btcRelay, bitcoinRpc);
    const tipBlock = await btcRelay.getTipData();
    console.log("[Main]: BTC relay tip height: ", tipBlock.blockheight);
    await syncToLatest(synchronizer);
    console.log("[Main]: Initial sync complete!");
    const sock = new zeromq_1.Subscriber();
    sock.connect("tcp://" + process.env.BTC_HOST + ":" + process.env.ZMQ_PORT);
    sock.subscribe("hashblock");
    console.log("[Main]: Listening to new blocks...");
    while (true) {
        try {
            try {
                for (var _d = true, sock_1 = (e_1 = void 0, __asyncValues(sock)), sock_1_1; sock_1_1 = await sock_1.next(), _a = sock_1_1.done, !_a;) {
                    _c = sock_1_1.value;
                    _d = false;
                    try {
                        const [topic, msg] = _c;
                        const blockHash = msg.toString("hex");
                        console.log("[Main]: New blockhash: ", blockHash);
                        await syncToLatest(synchronizer);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = sock_1.return)) await _b.call(sock_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (e) {
            console.error(e);
            console.log("[Main]: Error occurred in main...");
        }
    }
}
main().catch(e => {
    console.error(e);
});
