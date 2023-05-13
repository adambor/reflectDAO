<template>
  <div class="home">
    <Header />
    <div class="home-content">
      <h1>Proposals</h1>
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

      h1 {
        color:#fff;
        text-align: left;
        margin-bottom:1rem;
      }

    }
  }
</style>