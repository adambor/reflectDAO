import { BigNumber, Contract, providers } from "ethers";
import { Interface } from "ethers/lib/utils";
export type EVMBtcStoredHeader = {
    chainWork: BigNumber;
    reversedPrevBlockHash: string;
    merkleRoot: string;
    data1: BigNumber;
    data2: BigNumber;
};
export declare class EVMBtcRelay {
    provider: providers.Provider;
    contract: Contract;
    contractInterface: Interface;
    constructor(provider: providers.Provider, btcRelayContractAddress: string);
    retrieveLogAndBlockheight(blockData: {
        blockhash: string;
        height: number;
    }, requiredBlockheight?: number): Promise<{
        header: EVMBtcStoredHeader;
        height: number;
    }>;
}
