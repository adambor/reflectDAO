"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
class Utils {
    static stripWitnessData(txData) {
        const tx = bitcoinjs_lib_1.Transaction.fromBuffer(txData);
        for (let input of tx.ins) {
            input.witness = [];
        }
        return tx.toBuffer();
    }
}
exports.Utils = Utils;
