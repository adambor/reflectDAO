import { createStore } from "vuex";
import { EVMWallet, TokenManager, TokenStateTransitionState } from "reflectdao-lib";
import { ProposalDTO } from "@/dto/ProposalDTO";
import { StaticEVMWallet } from "@/StaticEVMWallet";

export default createStore({
  state: function () {
    return {
      proposals: null,
      chainId: 0,
      connected: false,
      balance: 0
    };
  },
  getters: {},
  mutations: {
    setConnected: function (state: any, status) {
      state.connected = status;
    },
    getProposals: async function (state: any) {
      let proposals = await StaticEVMWallet.wallet.getProposals();
      
      state.proposals = proposals.map(function (data: any) {
        return new ProposalDTO(
          data.id,
          data.createdAt,
          "",
          data.callData,
          data.name,
          data.description,
          data.expiry,
          data.author,
          data.voteYes,
          data.percentYes,
          data.voteNo,
          data.percentNo,
          data.totalVotes,
          data.quorumPercent,
          data.eligibleVotes,
          data.state,
          data.alreadyVoted
        );
      });
    },
    getTokenBalance: async function (state: any) {
      let balance = await StaticEVMWallet.wallet.getTokenBalance();
      state.balance = balance;
    }
  },
  actions: {
    connectWalletLinea: function (context) {
      return new Promise(async (resolve) => {
        let connection = await EVMWallet.connect(59140);
        StaticEVMWallet.wallet = connection;
        
        StaticEVMWallet.tokenManager = new TokenManager(connection);
        await StaticEVMWallet.tokenManager.verifyStateTransitions();

        for(let stateTransition of TokenManager.stateTransitions) {
          console.log(stateTransition);
          if (stateTransition.state == TokenStateTransitionState.CONFIRMED && stateTransition.smartChainTxs[StaticEVMWallet.wallet.chainId] == null) {
            await StaticEVMWallet.wallet.proveStateTransition(stateTransition);
            break;
          }
        }

        context.commit("setConnected", true);
        resolve(connection);
      });
    },
    connectWalletGnosis: function (context) {
      return new Promise(async (resolve) => {
        let connection = await EVMWallet.connect(10200);
        StaticEVMWallet.wallet = connection;
        
        StaticEVMWallet.tokenManager = new TokenManager(connection);
        await StaticEVMWallet.tokenManager.verifyStateTransitions();

        for(let stateTransition of TokenManager.stateTransitions) {
          console.log(stateTransition);
          if (stateTransition.state == TokenStateTransitionState.CONFIRMED && stateTransition.smartChainTxs[StaticEVMWallet.wallet.chainId] == null) {
            await StaticEVMWallet.wallet.proveStateTransition(stateTransition);
            break;
          }
        }

        context.commit("setConnected", true);
        resolve(connection);
      });
    },
    getProposals: function (context) {
      context.commit('getProposals');
    },
    getTokenBalance: function (context) {
      context.commit('getTokenBalance');
    }
  },
  modules: {},
});
