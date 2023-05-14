"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMBtcRelay = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const btcRelayContract_1 = require("../../../contracts/btcRelayContract");
const limit = 2500;
class EVMBtcRelay {
    constructor(provider, btcRelayContractAddress) {
        this.provider = provider;
        this.contract = new ethers_1.Contract(btcRelayContractAddress, btcRelayContract_1.btcRelayContract.abi, provider);
        this.contractInterface = new utils_1.Interface(btcRelayContract_1.btcRelayContract.abi);
    }
    // async retrieveLogAndBlockheight(blockData: {blockhash: string, height: number}, requiredBlockheight?: number): Promise<{
    //     header: EVMBtcStoredHeader,
    //     height: number
    // }> {
    //     return {
    //         header: {
    //             chainWork: BigNumber.from(0),
    //             reversedPrevBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    //             merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
    //             data1: BigNumber.from(0),
    //             data2: BigNumber.from(0),
    //         },
    //         height: 0
    //     }
    // }
    retrieveLogAndBlockheight(blockData, requiredBlockheight) {
        return __awaiter(this, void 0, void 0, function* () {
            let storedHeader = null;
            const highScoreAndBlockHeight = yield this.contract._highScoreAndBlockHeight();
            const blockHeight = highScoreAndBlockHeight.shr(224).toNumber();
            if (blockHeight < blockData.height) {
                //Btc relay not synchronized to required blockheight
                console.log("not synchronized to block's height");
                return null;
            }
            if (requiredBlockheight != null) {
                if (blockHeight < requiredBlockheight) {
                    //Btc relay not synchronized to required blockheight
                    console.log("not synchronized to required blockheight");
                    return null;
                }
            }
            let currentBlock = (yield this.provider.getBlockNumber()) - 1;
            while (storedHeader == null) {
                const params = {
                    address: this.contract.address,
                    fromBlock: currentBlock - limit,
                    toBlock: currentBlock
                };
                console.log("getLogs params: ", params);
                const logs = yield this.provider.getLogs(params);
                for (let i = logs.length - 1; i >= 0; i--) {
                    const log = logs[i];
                    const parsedLog = this.contractInterface.parseLog(log);
                    if (parsedLog.name === "StoreHeader" || parsedLog.name === "StoreFork") {
                        const reversedBlockHash = parsedLog.args.blockHash.substring(2); //Strip 0x
                        const commitHash = parsedLog.args.commitmentHash;
                        const blockHash = Buffer.from(reversedBlockHash, "hex").reverse().toString("hex");
                        if (blockHash === blockData.blockhash) {
                            storedHeader = parsedLog.args.storedHeader;
                            //Is it part of the main chain?
                            const committedData = yield this.contract.getCommitment(ethers_1.BigNumber.from(blockData.height));
                            if (committedData !== commitHash) {
                                return null;
                            }
                            break;
                        }
                    }
                }
                currentBlock -= limit;
                if (storedHeader == null) {
                    yield new Promise(resolve => {
                        setTimeout(resolve, 500);
                    });
                }
            }
            return {
                header: storedHeader,
                height: blockHeight
            };
        });
    }
}
exports.EVMBtcRelay = EVMBtcRelay;
