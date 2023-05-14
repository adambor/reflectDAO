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
const crypto_browserify_1 = require("crypto-browserify");
const cross_fetch_1 = require("cross-fetch");
let clients = {};
class ElectrumClient {
    static new(uri, reconnectDelay) {
        return __awaiter(this, void 0, void 0, function* () {
            if (clients[uri] == null) {
                clients[uri] = new ElectrumClient(uri, reconnectDelay);
                yield clients[uri].init();
            }
            return clients[uri];
        });
    }
    static stopAll() {
        const prevClients = clients;
        clients = {};
        for (let k in prevClients) {
            console.log("Stopping " + k + " electrum client");
            prevClients[k].close();
        }
    }
    constructor(uri, reconnectDelay) {
        this.uri = uri;
        this.reconnectDelay = reconnectDelay || 5000;
        this.msgIdCounter = 0;
        this.requests = {};
        this.pendingRequests = [];
        this.notificationHandlers = {
            "blockchain.scripthash.subscribe": {}
        };
        const cacheTxt = window.localStorage.getItem("electrum-" + uri);
        if (cacheTxt != null) {
            try {
                this.persistentState = JSON.parse(cacheTxt);
                return;
            }
            catch (e) {
                console.error(e);
            }
        }
        this.persistentState = {
            txs: {},
            addresses: {}
        };
    }
    flushPersistentState() {
        if (this.flushStateTimer != null)
            clearTimeout(this.flushStateTimer);
        this.flushStateTimer = setTimeout(() => {
            window.localStorage.setItem("electrum-" + this.uri, JSON.stringify(this.persistentState));
            this.flushStateTimer = null;
        }, 100);
    }
    getTransactionMerkleProof(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://mempool.space/testnet/api/tx/" + txId + "/merkle-proof";
            const res = yield (0, cross_fetch_1.default)(url, {
                method: "GET"
            });
            const result = yield res.json();
            return result;
        });
    }
    getTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistentState.txs[tx] != null) {
                return this.persistentState.txs[tx];
            }
            const transaction = yield this.sendRequest("blockchain.transaction.get", [
                tx, true
            ]);
            if (transaction.confirmations > 6) {
                this.persistentState.txs[tx] = transaction;
                this.flushPersistentState();
            }
            return transaction;
        });
    }
    getTransactionHex(tx) {
        return this.sendRequest("blockchain.transaction.get", [
            tx, false
        ]);
    }
    blockheaderUnsubscribe(cbk) {
        if (this.isClosed)
            return null;
        let response;
        const hashed = "";
        if (this.notificationHandlers["blockchain.headers.subscribe"] != null && this.notificationHandlers["blockchain.headers.subscribe"][hashed] != null) {
            response = this.notificationHandlers["blockchain.headers.subscribe"][hashed].status;
            if (this.notificationHandlers["blockchain.headers.subscribe"][hashed].callback != null) {
                const index = this.notificationHandlers["blockchain.headers.subscribe"][hashed].callback.indexOf(cbk);
                if (index >= 0) {
                    this.notificationHandlers["blockchain.headers.subscribe"][hashed].callback.splice(index, 1);
                    //Remove when no callbacks are registered
                    if (this.notificationHandlers["blockchain.headers.subscribe"][hashed].callback.length === 0) {
                        delete this.notificationHandlers["blockchain.headers.subscribe"][hashed];
                    }
                }
            }
        }
        return response;
    }
    blockheaderSubscribe(cbk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const response = yield this.sendRequest("blockchain.headers.subscribe", []);
            if (this.notificationHandlers["blockchain.headers.subscribe"] == null) {
                this.notificationHandlers["blockchain.headers.subscribe"] = {};
            }
            if (this.notificationHandlers["blockchain.headers.subscribe"][""] == null) {
                this.notificationHandlers["blockchain.headers.subscribe"][""] = {
                    callback: [],
                    status: response,
                    unsubscribe: null
                };
            }
            this.notificationHandlers["blockchain.headers.subscribe"][""].callback.push(cbk);
        });
    }
    addressUnsubscribe(address, cbk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            let response;
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                response = this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status;
                if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].callback != null) {
                    const index = this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].callback.indexOf(cbk);
                    if (index >= 0) {
                        this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].callback.splice(index, 1);
                        //Remove when no callbacks are registered
                        if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].callback.length === 0) {
                            response = yield this.sendRequest("blockchain.scripthash.unsubscribe", [
                                hashed
                            ]);
                            delete this.notificationHandlers["blockchain.scripthash.subscribe"][hashed];
                        }
                    }
                }
            }
            return response;
        });
    }
    addressSubscribe(address, cbk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            const response = yield this.sendRequest("blockchain.scripthash.subscribe", [
                hashed
            ]);
            if (this.notificationHandlers["blockchain.scripthash.subscribe"] == null) {
                this.notificationHandlers["blockchain.scripthash.subscribe"] = {};
            }
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] == null) {
                this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] = {
                    callback: [],
                    status: response,
                    unsubscribe: "blockchain.scripthash.unsubscribe"
                };
            }
            this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].callback.push(cbk);
            return response;
        });
    }
    addressSubscribeMultiple(addresses, cbk) {
        if (this.isClosed)
            return null;
        this.startBatch();
        const promises = [];
        for (let address of addresses) {
            promises.push(this.addressSubscribe(address, (status) => {
                cbk(address, status);
            }));
        }
        this.sendBatch();
        return Promise.all(promises);
    }
    getUnspent(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                const currentStatus = this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status;
                const addressData = this.persistentState.addresses[hashed];
                if (addressData != null && addressData.unspent != null && addressData.unspent.status === currentStatus) {
                    console.log("getUnspent(" + address.address + "-" + hashed + "): cached");
                    return addressData.unspent.txs;
                }
            }
            const txs = yield this.sendRequest("blockchain.scripthash.listunspent", [hashed]);
            console.log("getUnspent(" + address.address + "-" + hashed + "): fetched", this.persistentState.addresses[hashed]);
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                if (this.persistentState.addresses[hashed] == null)
                    this.persistentState.addresses[hashed] = {};
                this.persistentState.addresses[hashed].unspent = {
                    status: this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status,
                    txs
                };
                this.flushPersistentState();
            }
            return txs;
        });
    }
    getBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                const currentStatus = this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status;
                const addressData = this.persistentState.addresses[hashed];
                if (addressData != null && addressData.balance != null && addressData.balance.status === currentStatus) {
                    console.log("getBalance(" + address.address + "-" + hashed + "): cached");
                    return addressData.balance.balance;
                }
            }
            const balance = yield this.sendRequest("blockchain.scripthash.get_balance", [hashed]);
            console.log("getBalance(" + address.address + "-" + hashed + "): fetched", this.persistentState.addresses[hashed]);
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                if (this.persistentState.addresses[hashed] == null)
                    this.persistentState.addresses[hashed] = {};
                this.persistentState.addresses[hashed].balance = {
                    status: this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status,
                    balance
                };
                this.flushPersistentState();
            }
            return balance;
        });
    }
    getHistory(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                const currentStatus = this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status;
                const addressData = this.persistentState.addresses[hashed];
                if (addressData != null && addressData.history != null && addressData.history.status === currentStatus) {
                    console.log("getHistory(" + address.address + "-" + hashed + "): cached");
                    return addressData.history.txs;
                }
            }
            const data = yield this.sendRequest("blockchain.scripthash.get_history", [hashed]);
            console.log("getHistory(" + address.address + "-" + hashed + "): fetched", this.persistentState.addresses[hashed]);
            if (this.notificationHandlers["blockchain.scripthash.subscribe"][hashed] != null) {
                if (this.persistentState.addresses[hashed] == null)
                    this.persistentState.addresses[hashed] = {};
                this.persistentState.addresses[hashed].history = {
                    status: this.notificationHandlers["blockchain.scripthash.subscribe"][hashed].status,
                    txs: data
                };
                this.flushPersistentState();
            }
            return data;
        });
    }
    getBtcBalanceMultiple(addresses, balanceOnly) {
        if (this.isClosed)
            return null;
        const promises = [];
        for (let address of addresses) {
            const hashed = (0, crypto_browserify_1.createHash)("sha256").update(address.output).digest().reverse().toString("hex"); //Reversed sha256 hash
            console.log("Output script: ", address.output);
            console.log("Addr hash: ", hashed);
            promises.push((() => __awaiter(this, void 0, void 0, function* () {
                if (balanceOnly) {
                    const res = yield this.getBalance(address);
                    return {
                        address: address.address,
                        addressRaw: address,
                        balance: res.confirmed + res.unconfirmed,
                        utxos: []
                    };
                }
                else {
                    const res = yield this.getHistory(address);
                    if (res.length === 0)
                        return {
                            address: address.address,
                            addressRaw: address,
                            balance: null,
                            utxos: []
                        };
                    const resUnspent = yield this.getUnspent(address);
                    const utxos = [];
                    let addressValue = 0;
                    for (let preTx of resUnspent) {
                        utxos.push({
                            vout: preTx.tx_pos,
                            txId: preTx.tx_hash,
                            value: preTx.value,
                            script: address.output.toString("hex")
                        });
                        addressValue += preTx.value;
                    }
                    return {
                        address: address.address,
                        addressRaw: address,
                        balance: addressValue,
                        utxos
                    };
                }
            }))());
        }
        return Promise.all(promises);
    }
    fetchFees() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            const promises = [];
            const blocks = [1, 3, 6];
            let cnt = 0;
            for (let block of blocks) {
                const i = cnt;
                cnt++;
                promises.push((() => __awaiter(this, void 0, void 0, function* () {
                    let res = yield this.sendRequest("blockchain.estimatefee", [block]);
                    if (res === -1) {
                        res = 1;
                    }
                    else {
                        res *= 100000000;
                        res /= 1024;
                        res = Math.round(res);
                    }
                    return {
                        i,
                        res
                    };
                }))());
            }
            const promiseResults = yield Promise.all(promises);
            const result = [];
            for (const promiseResult of promiseResults) {
                result[promiseResult.i] = promiseResult.res;
            }
            return result;
        });
    }
    sendTransaction(txHex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClosed)
                return null;
            try {
                const res = yield this.sendRequest("blockchain.transaction.broadcast", [txHex]);
                return res;
            }
            catch (e) {
                console.log(e);
                throw "Cannot broadcast transaction!";
            }
        });
    }
    startBatch() {
        if (this.messageBatch != null)
            return false;
        this.messageBatch = [];
        return true;
    }
    sendBatch() {
        if (this.messageBatch == null)
            return false;
        if (this.ws == null || this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
            this.pendingRequests.push(...this.messageBatch);
            if (this.ws.readyState !== WebSocket.CONNECTING) {
                if (this.reconnectTimeout != null)
                    clearTimeout(this.reconnectTimeout);
                this.connect();
            }
        }
        else {
            this.ws.send(JSON.stringify(this.messageBatch));
        }
        this.messageBatch = null;
        return true;
    }
    sendRequest(method, params) {
        return new Promise((resolve, reject) => {
            const msgId = this.msgIdCounter++;
            let msg = {
                jsonrpc: "2.0",
                id: msgId,
                method,
                params
            };
            this.requests[msgId] = {
                resolve,
                reject
            };
            msg.timeout = setTimeout(() => {
                if (this.requests[msg.id] != null) {
                    this.requests[msg.id].reject("Timed out");
                    delete this.requests[msg.id];
                }
            }, 5000);
            this.requests[msgId].timeout = msg.timeout;
            if (this.messageBatch != null) {
                const cpy = Object.assign({}, msg);
                delete cpy.timeout;
                this.messageBatch.push(cpy);
                return;
            }
            if (this.ws == null || this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
                this.pendingRequests.push(msg);
                if (this.ws.readyState !== WebSocket.CONNECTING) {
                    if (this.reconnectTimeout != null)
                        clearTimeout(this.reconnectTimeout);
                    this.connect();
                }
            }
            else {
                if (msg.timeout != null) {
                    msg = Object.assign({}, msg);
                    delete msg.timeout;
                }
                this.ws.send(JSON.stringify(msg));
            }
        });
    }
    processServerMessage(obj) {
        if (obj.method != null) {
            if (this.notificationHandlers[obj.method] != null) {
                if (obj.params.length === 1) {
                    if (this.notificationHandlers[obj.method][""] != null) {
                        this.notificationHandlers[obj.method][""].status = obj.params[1];
                        for (let cbk of this.notificationHandlers[obj.method][""].callback) {
                            cbk(obj.params[0]);
                        }
                    }
                }
                else {
                    if (this.notificationHandlers[obj.method][obj.params[0]] != null) {
                        this.notificationHandlers[obj.method][obj.params[0]].status = obj.params[1];
                        for (let cbk of this.notificationHandlers[obj.method][obj.params[0]].callback) {
                            cbk(obj.params[1]);
                        }
                    }
                }
            }
            return;
        }
        if (this.requests[obj.id] != null) {
            if (obj.error != null) {
                this.requests[obj.id].reject(obj.error);
            }
            else {
                this.requests[obj.id].resolve(obj.result);
            }
            clearTimeout(this.requests[obj.id].timeout);
            delete this.requests[obj.id];
            return;
        }
    }
    addWSHandlers() {
        this.ws.onclose = (event) => {
            if (this.wsPinger != null)
                clearInterval(this.wsPinger);
            this.wsPinger = null;
            if (this.isClosed)
                return;
            for (let msg of this.pendingRequests) {
                this.requests[msg.id].reject("Disconnected");
                clearTimeout(this.requests[msg.id].timeout);
                delete this.requests[msg.id];
            }
            this.pendingRequests = [];
            console.log("Connection closed! Reconnect in " + this.reconnectDelay + "ms");
            this.ws = null;
            this.reconnectTimeout = setTimeout(this.connect.bind(this), this.reconnectDelay);
        };
        this.ws.onmessage = (event) => {
            const obj = JSON.parse(event.data);
            if (Array.isArray(obj)) {
                for (let res of obj) {
                    this.processServerMessage(res);
                }
            }
            else {
                this.processServerMessage(obj);
            }
            console.log(event.data);
        };
        this.wsPinger = setInterval(() => {
            this.sendRequest("server.ping", []);
        }, 60 * 1000); //Keepalive
    }
    resubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (let key in this.notificationHandlers) {
                for (let key2 in this.notificationHandlers[key]) {
                    promises.push((() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const result = yield this.sendRequest(key, key2 === "" ? [] : [
                                key2
                            ]);
                            //Possible unsubscribe during sendRequest
                            if (this.notificationHandlers[key][key2] != null) {
                                if (this.notificationHandlers[key][key2].status !== result) {
                                    this.notificationHandlers[key][key2].status = result;
                                    for (let cbk of this.notificationHandlers[key][key2].callback) {
                                        cbk(null);
                                    }
                                }
                            }
                            else {
                                if (this.notificationHandlers[key][key2].unsubscribe != null) {
                                    const result = yield this.sendRequest(this.notificationHandlers[key][key2].unsubscribe, [
                                        key2
                                    ]);
                                }
                            }
                        }
                        catch (e) {
                            if (this.notificationHandlers[key][key2] != null) {
                                for (let cbk of this.notificationHandlers[key][key2].callback) {
                                    cbk(null);
                                }
                                delete this.notificationHandlers[key][key2];
                            }
                            console.log(e);
                        }
                    }))());
                }
            }
            if (promises.length > 0)
                yield Promise.all(promises);
        });
    }
    connect() {
        this.isClosed = false;
        this.reconnectTimeout = null;
        console.log("WS connect to: ", this.uri);
        this.ws = new WebSocket(this.uri);
        this.ws.onopen = (event) => {
            console.log("Connection opened!");
            let batch = [];
            for (let msg of this.pendingRequests) {
                if (msg.timeout != null) {
                    msg = Object.assign({}, msg);
                    delete msg.timeout;
                }
                batch.push(msg);
                if (batch.length === 100) {
                    this.ws.send(JSON.stringify(batch));
                    batch = [];
                }
            }
            if (batch.length > 0) {
                this.ws.send(JSON.stringify(batch));
            }
            this.pendingRequests = [];
            this.resubscribe();
        };
        this.addWSHandlers();
    }
    //Async
    init() {
        return new Promise((resolve, reject) => {
            this.isClosed = false;
            this.ws = new WebSocket(this.uri);
            this.ws.onopen = (event) => {
                this.ws.onclose = null;
                this.addWSHandlers();
                resolve();
            };
            this.ws.onclose = (event) => {
                reject();
            };
        });
    }
    close() {
        this.isClosed = true;
        console.log("websocket: ", this.ws);
        if (this.ws != null) {
            // @ts-ignore
            if (this.ws.websocket != null) {
                // @ts-ignore
                this.ws.websocket.close();
            }
            else {
                this.ws.close();
            }
        }
        this.ws = null;
        if (this.wsPinger != null)
            clearInterval(this.wsPinger);
        this.wsPinger = null;
        if (this.reconnectTimeout != null)
            clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
        this.notificationHandlers = {};
        this.pendingRequests = [];
    }
}
exports.default = ElectrumClient;
