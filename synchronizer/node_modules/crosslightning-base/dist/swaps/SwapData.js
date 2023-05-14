"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapData = void 0;
class SwapData {
    static deserialize(data) {
        if (SwapData.deserializers[data.type] != null) {
            return new SwapData.deserializers[data.type](data);
        }
    }
}
exports.SwapData = SwapData;
SwapData.deserializers = {};
