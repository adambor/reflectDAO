"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapCommitStatus = void 0;
var SwapCommitStatus;
(function (SwapCommitStatus) {
    SwapCommitStatus[SwapCommitStatus["EXPIRED"] = 0] = "EXPIRED";
    SwapCommitStatus[SwapCommitStatus["NOT_COMMITED"] = 1] = "NOT_COMMITED";
    SwapCommitStatus[SwapCommitStatus["COMMITED"] = 2] = "COMMITED";
    SwapCommitStatus[SwapCommitStatus["PAID"] = 3] = "PAID";
    SwapCommitStatus[SwapCommitStatus["REFUNDABLE"] = 4] = "REFUNDABLE";
})(SwapCommitStatus = exports.SwapCommitStatus || (exports.SwapCommitStatus = {}));
