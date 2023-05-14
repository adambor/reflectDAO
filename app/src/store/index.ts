import { createStore } from "vuex";
import { EVMWallet, TokenManager, TokenStateTransitionState } from "reflectdao-lib";
import { ProposalDTO } from "@/dto/ProposalDTO";

export default createStore({
  state: function () {
    return {
      wallet: null,
      tokenManager: null,
      proposals: null,
      chainId: 0,
      connected: false,
      balance: 0
    };
  },
  getters: {},
  mutations: {
    connectWallet: async function (state: any) {
      return new Promise(async (resolve) => {
        let connection = await EVMWallet.connect(59140);
        state.wallet = connection;
        state.tokenManager = new TokenManager(connection);
        await state.tokenManager.verifyStateTransitions();

        for(let stateTransition of TokenManager.stateTransitions) {
          console.log(stateTransition);
          if (stateTransition.state == TokenStateTransitionState.CONFIRMED && stateTransition.smartChainTxs[state.wallet.chainId] == null) {
            await state.wallet.proveStateTransition(stateTransition);
            break;
          }
        }

        state.connected = true;
        resolve(connection);
      });
    },
    getProposals: async function (state: any) {
      let proposals = await state.wallet.getProposals();
      
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
      let balance = await state.wallet.getTokenBalance();
      state.balance = balance;
    }
  },
  actions: {
    connectWallet: function (context) {
      context.commit('connectWallet');
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
