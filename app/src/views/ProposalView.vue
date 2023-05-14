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

@Options({
  components: {
    Header,
    Proposal
  },
  methods: {
      getProposal: function () {
        return this.$store.state.proposals[this.$route.params.id];
      }
  }
})
export default class ProposalView extends Vue {}
</script>

<style lang="scss" scoped>
  .proposal-section {
      max-width:1000px;
      margin:0 auto;
      overflow:auto;
  }
</style>