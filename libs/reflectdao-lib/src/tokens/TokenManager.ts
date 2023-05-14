import {BigNumber} from "ethers";
import {BitcoinWallet} from "./bitcoin/BitcoinWallet";
import {EVMWallet} from "./evm/EVMWallet";
import {TokenStateTransition, TokenStateTransitionOuput, TokenStateTransitionState} from "./TokenStateTransition";
import {CHAINS, CONFIRMATIONS_REQUIRED} from "../Constants";


export class TokenManager {

    btcWallet: BitcoinWallet;
    evmWallet: EVMWallet;

    static stateTransitions: TokenStateTransition[];

    static load() {
        let storedJson = localStorage.getItem("state-transitions");
        if(storedJson==null) {
            storedJson = "[]";
        }
        const storedObject = JSON.parse(storedJson);
        this.stateTransitions = storedObject.map(e => TokenStateTransition.deserialize(e));
    }

    static save() {
        localStorage.setItem("state-transitions", JSON.stringify(this.stateTransitions.map(e=>e.serialize())));
    }

    constructor(evmWallet: EVMWallet) {
        this.btcWallet = evmWallet.btcWallet;
        this.evmWallet = evmWallet;
    }

    async verifyStateTransitions() {
        for(let stateTransition of TokenManager.stateTransitions) {
            if(stateTransition.state===TokenStateTransitionState.CONFIRMED || TokenStateTransitionState.SENT) {
                if(stateTransition.btcTxId!=null) {
                    //Check if already confirmed
                    const txResult = await this.btcWallet.electrumClient.getTransaction(stateTransition.btcTxId);
                    if(txResult!=null) {
                        if(txResult.confirmations>=CONFIRMATIONS_REQUIRED) {
                            stateTransition.state = TokenStateTransitionState.CONFIRMED;
                        } else {
                            stateTransition.state = TokenStateTransitionState.SENT;
                        }
                    } else {
                        stateTransition.state = TokenStateTransitionState.CREATED;
                    }
                }
            }
            if(stateTransition.state===TokenStateTransitionState.CONFIRMED) {
                //Check if confirmed on the smart chain
                const chainStatus = stateTransition.smartChainTxs[this.evmWallet.chainId];
                if(chainStatus!=null) {
                    if(!stateTransition.smartChainTxs[this.evmWallet.chainId].confirmed) {
                        const receipt = await this.evmWallet.provider.getTransactionReceipt(chainStatus.txId);
                        if(receipt==null || !receipt.status) {
                            delete stateTransition.smartChainTxs[this.evmWallet.chainId];
                        } else {
                            //Successfully confirmed
                            chainStatus.confirmed = true;
                        }
                    }
                    if(chainStatus.confirmed) {
                        //Check if it's confirmed on all chains
                        const isAllConfirmed = stateTransition.allConfirmed(Object.keys(CHAINS).map(e => parseInt(e)));
                        if(isAllConfirmed) {
                            stateTransition.state = TokenStateTransitionState.SYNCED;
                        }
                    }
                }
            }
        }
        TokenManager.save();
    }

    async createSendStateTransition(_recipientUtxoHash: string, amount: number): Promise<TokenStateTransition> {

        if(_recipientUtxoHash.length!=64) throw new Error("Invalid length of UTXO hash");

        const recipientUtxoHash = Buffer.from(_recipientUtxoHash, "hex");

        const unlockedUtxos = await this.btcWallet.getUnlockedUtxos();

        const balances = await this.evmWallet.getTokenBalances(unlockedUtxos);

        const change = balances.unlockedTokens.sub(BigNumber.from(amount));

        if(change.lt(BigNumber.from(0))) throw new Error("Sending more tokens than owned");

        const stateTransitionOutputs: TokenStateTransitionOuput[] = [];

        stateTransitionOutputs.push({
            utxoHash: recipientUtxoHash,
            balance: BigNumber.from(amount),
            timelock: null,
            publicKey: null
        });

        if(!change.isZero()) {
            //Add state transition to self
            stateTransitionOutputs.push({
                utxoHash: Buffer.alloc(32, 0),
                balance: change,
                timelock: null,
                publicKey: null
            });
        }

        return new TokenStateTransition(unlockedUtxos, stateTransitionOutputs);

    }

    async createLockStateTransition(expiryInDays: number, amount: number): Promise<TokenStateTransition> {

        const address = await this.evmWallet.provider.getSigner().getAddress();

        const timeLock = BigNumber.from(
            Math.floor((Date.now()+(expiryInDays*24*60*60*1000))/1000)
        );

        const unlockedUtxos = await this.btcWallet.getUnlockedUtxos();

        const balances = await this.evmWallet.getTokenBalances(unlockedUtxos);

        const change = balances.unlockedTokens.sub(BigNumber.from(amount));

        if(change.lt(BigNumber.from(0))) throw new Error("Locking more tokens than owned");

        const stateTransitionOutputs: TokenStateTransitionOuput[] = [];

        stateTransitionOutputs.push({
            utxoHash: Buffer.alloc(32, 0),
            balance: BigNumber.from(amount),
            timelock: timeLock,
            publicKey: address
        });

        if(!change.isZero()) {
            //Add change state transition to self
            stateTransitionOutputs.push({
                utxoHash: Buffer.from("0000000000000000000000000000000000000000000000000000000000000001", "hex"),
                balance: change,
                timelock: null,
                publicKey: null
            });
        }

        return new TokenStateTransition(unlockedUtxos, stateTransitionOutputs);

    }

}