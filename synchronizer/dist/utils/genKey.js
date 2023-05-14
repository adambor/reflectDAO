"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const fs = require("fs");
const keypair = ethers_1.Wallet.createRandom();
const address = keypair.address;
fs.appendFileSync(".env", "EVM_PRIVKEY=\"" + keypair.privateKey + "\"\n" +
    "EVM_ADDRESS=\"" + address + "\"\n");
console.log("Generated address: " + address);
