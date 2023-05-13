<template>
  <div class="proposal-list">
    <Proposal />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Proposal from "@/components/Proposal.vue";

@Options({
  components: {
    Proposal
  },
  data: function () {
    return {
    }
  },
  props: {
    msg: String,
  },
})
export default class ProposalList extends Vue {

}
</script>

<style scoped lang="scss">
  
</style>
