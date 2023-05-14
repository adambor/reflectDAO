<template>
  <div class="badge" :class="{
    'voting': state == 0, 
    'success': state == 1, 
    'failed': state == 2 || state == 3 || state == 4
  }">
    <p v-text="text"></p>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ProposalStateEnum } from "@/enum/ProposalStateEnum";

@Options({
  data: function () {
    return {
    }
  },
  props: {
    state: ProposalStateEnum
  },
  computed: {
    text: function () {
      let states = new Map([
        [ProposalStateEnum.VOTING, "Voting"],
        [ProposalStateEnum.SUCCESS, "Approved"],
        [ProposalStateEnum.SUCCESS_CALL_FAILED, "Failed"],
        [ProposalStateEnum.FAILED_QUORUM, "Failed"],
        [ProposalStateEnum.FAILED_VOTE_NO, "Declined"],
      ]);

      return states.get(this.state);
    }
  }
})
export default class Search extends Vue {
  text!: string;
}
</script>

<style scoped lang="scss">
  .badge {
    width:100%;
    max-width:100px;
    border-radius:1rem;
    font-size:.8rem;
    padding: .2rem 1rem;
    box-sizing: border-box;
    color:#fff;

    &.voting {
      background-color:rgb(226, 141, 30);
    }

    &.success {
      background-color:var(--approve-color);
    }

    &.failed {
      background-color:rgb(226, 37, 30);
    }

  }
</style>
