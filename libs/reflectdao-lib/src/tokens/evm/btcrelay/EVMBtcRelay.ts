import {BigNumber, Contract, providers} from "ethers";
import {Interface} from "ethers/lib/utils";
import {btcRelayContract} from "../../../contracts/btcRelayContract";

const limit = 2500;

export type EVMBtcStoredHeader = {
    chainWork: BigNumber;
    reversedPrevBlockHash: string;
    merkleRoot: string;
    data1: BigNumber;
    data2: BigNumber;
};

export class EVMBtcRelay {

    provider: providers.Provider;
    contract: Contract;
    contractInterface: Interface;

    constructor(provider: providers.Provider, btcRelayContractAddress: string) {
        this.provider = provider;
        this.contract = new Contract(btcRelayContractAddress, btcRelayContract.abi, provider);
        this.contractInterface = new Interface(btcRelayContract.abi);

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

    async retrieveLogAndBlockheight(blockData: {blockhash: string, height: number}, requiredBlockheight?: number): Promise<{
        header: EVMBtcStoredHeader,
        height: number
    }> {
        let storedHeader: EVMBtcStoredHeader = null;

        const highScoreAndBlockHeight: BigNumber = await this.contract._highScoreAndBlockHeight();
        const blockHeight: number = highScoreAndBlockHeight.shr(224).toNumber();

        if(blockHeight < blockData.height) {
            //Btc relay not synchronized to required blockheight
            console.log("not synchronized to block's height");
            return null;
        }

        if(requiredBlockheight!=null) {
            if(blockHeight < requiredBlockheight) {
                //Btc relay not synchronized to required blockheight
                console.log("not synchronized to required blockheight");
                return null;
            }
        }

        let currentBlock = (await this.provider.getBlockNumber())-1;
        while(storedHeader==null) {
            const params = {
                address: this.contract.address,
                fromBlock: currentBlock-limit,
                toBlock: currentBlock
            };
            console.log("getLogs params: ", params);
            const logs = await this.provider.getLogs(params);
            for(let i=logs.length-1;i>=0;i--) {
                const log = logs[i];
                const parsedLog = this.contractInterface.parseLog(log);
                if(parsedLog.name==="StoreHeader" || parsedLog.name==="StoreFork") {
                    const reversedBlockHash: string = parsedLog.args.blockHash.substring(2); //Strip 0x
                    const commitHash: string = parsedLog.args.commitmentHash;
                    const blockHash: string = Buffer.from(reversedBlockHash, "hex").reverse().toString("hex");
                    if(blockHash===blockData.blockhash) {
                        storedHeader = parsedLog.args.storedHeader;
                        //Is it part of the main chain?
                        const committedData = await this.contract.getCommitment(BigNumber.from(blockData.height));
                        if(committedData!==commitHash) {
                            return null;
                        }
                        break;
                    }
                }
            }
            currentBlock -= limit;
            if(storedHeader==null) {
                await new Promise(resolve => {
                    setTimeout(resolve, 500)
                });
            }
        }

        return {
            header: storedHeader,
            height: blockHeight
        };
    }

}