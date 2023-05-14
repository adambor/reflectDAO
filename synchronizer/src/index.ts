import * as dotenv from "dotenv";
dotenv.config();

import {EVMSigner} from "./evm/EVMSigner";
import * as fs from "fs/promises";
import {Subscriber} from "zeromq";
import {EVMBtcRelay, EVMBtcStoredHeader, EVMSwapData, EVMSwapProgram} from "crosslightning-evm";
import {BtcRPCConfig} from "./btc/BtcRPC";
import {BitcoindBlock, BitcoindRpc, BtcRelaySynchronizer} from "btcrelay-bitcoind";
import {UnsignedTransaction} from "ethers";

async function syncToLatest(
    synchronizer: BtcRelaySynchronizer<EVMBtcStoredHeader, UnsignedTransaction>
) {

    console.log("[Main]: Syncing to latest...");

    const resp = await synchronizer.syncToLatestTxs();

    for(let key in resp.computedHeaderMap) {
        const computedHeader = resp.computedHeaderMap[key];
        console.log("Computed header, height: "+key+": ", {
            chainWork: computedHeader.chainWork.toHexString(),
            reversedPrevBlockHash: computedHeader.reversedPrevBlockHash,
            merkleRoot: computedHeader.merkleRoot,
            data1: computedHeader.data1.toHexString(),
            data2: computedHeader.data2.toHexString(),
        })
    }

    const totalTxs = resp.txs;

    //TODO: Figure out some recovery here, since all relayers will be publishing blookheaders and claiming swaps
    let signature;
    for(let i=0;i<totalTxs.length;i++) {
        const tx = totalTxs[i];
        console.log("[Main]: Sending tx: ", i);
        signature = await EVMSigner.sendTransaction(tx);
        console.log("[Main]: TX sent: ", signature);
    }
    if(signature!=null) {
        await EVMSigner.provider.waitForTransaction(signature.hash);
    }
    console.log("[Main]: All txs confirmed!");


}

async function main() {

    try {
        await fs.mkdir("storage")
    } catch (e) {}

    await EVMSigner.init();

    const bitcoinRpc = new BitcoindRpc(
        BtcRPCConfig.protocol,
        BtcRPCConfig.user,
        BtcRPCConfig.pass,
        BtcRPCConfig.host,
        BtcRPCConfig.port
    );
    const btcRelay = new EVMBtcRelay<BitcoindBlock>(EVMSigner, bitcoinRpc, process.env.EVM_BTC_RELAY_CONTRACT_ADDRESS);
    const synchronizer = new BtcRelaySynchronizer(btcRelay, bitcoinRpc);

    const tipBlock = await btcRelay.getTipData();

    console.log("[Main]: BTC relay tip height: ", tipBlock.blockheight);

    await syncToLatest(synchronizer);

    console.log("[Main]: Initial sync complete!");

    const sock = new Subscriber();
    sock.connect("tcp://"+process.env.BTC_HOST+":"+process.env.ZMQ_PORT);
    sock.subscribe("hashblock");

    console.log("[Main]: Listening to new blocks...");
    while(true) {
        try {
            for await (const [topic, msg] of sock) {
                const blockHash = msg.toString("hex");
                console.log("[Main]: New blockhash: ", blockHash);
                await syncToLatest(synchronizer);
            }
        } catch (e) {
            console.error(e);
            console.log("[Main]: Error occurred in main...");
        }
    }

}

main().catch(e => {
    console.error(e);
});