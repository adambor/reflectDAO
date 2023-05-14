<template>
    <template v-if="this.$store.state.connected">
      <div>
        <p class="welcome-text">Your balance</p>
        <p class="tokens">Locked: {{ this.$store.state.balance.lockedTokens }} | Unlocked: {{ this.$store.state.balance.unlockedTokens }} | Total: {{ this.$store.state.balance.totalTokens }}</p>
      </div>
    </template>

    <template v-else>
      <button @click="connectWalletGnosis()">Connect wallet (Gnosis)</button>
      <button @click="connectWalletLinea()">Connect wallet (Linea)</button>
    </template>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
  },
  methods: {
    connectWalletLinea: async function () {
      this.$store.dispatch("connectWalletLinea").then(() => {
        this.$store.dispatch("getProposals");
        this.$store.dispatch("getTokenBalance");
      });
    },
    connectWalletGnosis: async function () {
      this.$store.dispatch("connectWalletGnosis").then(() => {
        this.$store.dispatch("getProposals");
        this.$store.dispatch("getTokenBalance");
      });
    }
  }
})
export default class Wallet extends Vue {
}
</script>

<style scoped lang="scss">
  button {
    padding: .8rem 1.3rem;
    background-color:transparent;
    border:0;
    border:2px solid rgba(255,255,255,.1);
    border-radius:10px;
    box-sizing: border-box;
    color:rgba(255,255,255,.8);
    cursor:pointer;

    &:not(:last-of-type) {
      margin-right:.5rem;
    }
    
    &:hover {
      background-color:rgba(255,255,255,.02);
    }

  }

  select {
    width:100%;
    max-width:300px;
    border:0;
    background-color:transparent;
    border: 1px solid rgba(255,255,255,.1);
    padding: 1rem 2rem;
    outline-style: none;
    color:#fff;
    box-sizing: border-box;
  }

  .welcome-text {
    color:#fff;
    font-size:.8rem;
    font-weight: bold;
  }

  .tokens {
    font-size:.8rem;
    color:#fff;
  }

</style>
