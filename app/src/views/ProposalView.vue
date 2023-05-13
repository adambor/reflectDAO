<template>
    <Header />
    <div class="proposal-section">
        <Proposal :proposal="getProposal()"/>
    </div>
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Header from "@/components/Header.vue";
import Proposal from "@/components/Proposal.vue";
import { ProposalDTO } from "@/dto/ProposalDTO";
import { ProposalStateEnum } from "@/enum/ProposalStateEnum";

@Options({
  components: {
    Header,
    Proposal
  },
  methods: {
      getProposal: function () {
          // @TODO: Get the proposal from the blockchain
          return new ProposalDTO(
              1,
              1000000,
              "",
              "",
              "[ARFC] Add rETH to Aave V3 Arbitrum Liquidity Pool",
              "rETH is listed on Aave v3 Ethereum and has over $20M of deposits. Rocket Pools is expanding its support for rETH across the L2 ecosystem, first Optimism, now Arbitrum and soon Polygon. There are currently only Chainlink Oracles for Arbitrum and Ethereum.",
              1000000,
              "reflectdao.eth",
              1,
              100,
              0,
              0,
              1,
              50,
              1,
              ProposalStateEnum.VOTING,
              false
          )
      }
  }
})
export default class HomeView extends Vue {}
</script>

<style lang="scss" scoped>
  .proposal-section {
      max-width:1000px;
      margin:0 auto;
      overflow:auto;
  }
</style>