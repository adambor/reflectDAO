<template>
  <div class="proposal-list">
    
    <template v-if="this.$store.state.proposals">
      <div v-for="proposal in this.$store.state.proposals" v-bind:key="proposal.id">
        <router-link :to="getURL(proposal.id)">
          <ProposalCard :proposal="proposal" />
        </router-link>
      </div>
    </template>

    <template v-else>
      <h1>Please, connect your wallet to start exploring proposals.</h1>
    </template>

  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ProposalCard from "@/components/ProposalCard.vue";

@Options({
  components: {
    ProposalCard
  },
  data: function () {
    return {
    }
  },
  methods: {
    getURL: function (id: number) {
      return "proposal/" + id;
    } 
  }
})
export default class ProposalList extends Vue {

}
</script>

<style scoped lang="scss">
  .proposal-list {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-between;

    > h1 {
      color:rgba(255,255,255,.4);
      text-align:left;
      font-size:3rem;
    }

    a {
      text-decoration: none;
    }

  }
</style>
