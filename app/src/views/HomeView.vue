<template>
  <div class="home">
    <Header />
    <div class="home-content">
      <div class="main-title">
        <h1>Proposals</h1>
        <template v-if="this.$store.state.connected && this.$store.state.balance.totalTokens != this.$store.state.balance.lockedTokens">
          <router-link to="/lock">
            <button>Lock your tokens</button>
          </router-link>
        </template>
      </div>
      <ProposalList />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Header from "@/components/Header.vue";
import ProposalList from "@/components/lists/ProposalList.vue";

@Options({
  components: {
    Header,
    ProposalList
  },
})
export default class HomeView extends Vue {}
</script>

<style lang="scss" scoped>
  .home {
    .home-content {
      padding: 1rem;
      box-sizing:border-box;
      max-width:1000px;
      margin:0 auto;

      .main-title {
        display:flex;
        justify-content: space-between;
        align-items: center;
        width:100%;
        margin-bottom:1rem;
        color:#fff;

        button {
          padding: .5rem 1rem;
          background-color:transparent;
          border:0;
          border:2px solid rgba(255,255,255,.1);
          border-radius:10px;
          box-sizing: border-box;
          color:rgba(255,255,255,.8);
          cursor:pointer;
          
          &:hover {
            background-color:rgba(255,255,255,.02);
          }
        }

      }

    }
  }
</style>