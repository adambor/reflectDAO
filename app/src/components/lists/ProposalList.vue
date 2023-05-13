<template>
  <div class="proposal-list">
    <ProposalCard />
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
  props: {
    msg: String,
  },
})
export default class ProposalList extends Vue {

}
</script>

<style scoped lang="scss">
  .proposal-list {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
</style>
