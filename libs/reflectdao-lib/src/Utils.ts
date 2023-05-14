import {Transaction} from "bitcoinjs-lib";


export class Utils {

    static stripWitnessData(txData: Buffer): Buffer {

        const tx = Transaction.fromBuffer(txData);

        for(let input of tx.ins) {
            input.witness = [];
        }

        return tx.toBuffer();

    }

}