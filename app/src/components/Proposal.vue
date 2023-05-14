<template>
    <div class="proposal">
      <div class="back-section">
        <router-link to="/">
          <span><RightArrowIcon /></span> Back
        </router-link>
      </div>
      <div class="body-section">
        <div class="title-container">
          <h1 v-text="proposal.name"></h1>
          <div class="badge-container">
            <Badge />
          </div>
        </div>
        <div class="profile-section">
          <div class="pic"></div>
          <div class="profile-name">
            <p v-text="proposal.author"></p>
          </div>
        </div>
        <div class="description-section">
          <h2>Proposal description</h2>
          <p v-text="proposal.description"></p>
        </div>
      </div>
      <div class="voting-section">
        <Poll
          :proposal="proposal"
          :voteYes="proposal.voteYes"
          :voteNo="proposal.voteNo"
          :percentYes="proposal.percentYes"
          :percentNo="proposal.percentNo"
          :totalVotes="proposal.totalVotes"
          :alreadyVoted="proposal.alreadyVoted"
          :quorumPercent="proposal.quorumPercent"
        />
      </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import RightArrowIcon from "./icons/RightArrowIcon.vue";
import Badge from "@/components/Badge.vue";
import { ProposalDTO } from "@/dto/ProposalDTO";
import Poll from "@/components/Poll.vue";

@Options({
  components: {
    RightArrowIcon,
    Badge,
    Poll
  },
  data: function () {
    return {
    }
  },
  props: {
    proposal: ProposalDTO
  },
})
export default class Wallet extends Vue {
}
</script>

<style scoped lang="scss">
.proposal {
  padding: 1rem;

  .back-section {

    a {
      display:flex;
      align-items:center;
      text-decoration: none;
      color:rgba(255,255,255,.8);
      font-weight: bold;
      transition: all .2s;

      &:hover {
        color:rgba(255,255,255,1);
        transition: all .2s;
      }

      span {
        display:flex;
        align-items:center;
        margin-right:.3rem;

        svg {
          width:100%;
          max-width:20px;
          transform:rotate(180deg);
        }
      }
    }
  }

  .body-section {
    position:relative;
    text-align:left;
    color:#fff;
    padding: 1em 0;

    .title-container {
      display:flex;

      .badge-container {
        display:flex;
        align-items:center;
        margin-left:1rem;
      }

    }

    .profile-section {
      display:flex;
      align-items:center;
      padding: .5em 0;
      .pic {
        width:30px;
        height:30px;
        border-radius:100%;
        background-color:rgba(255,255,255,.1);
        margin-right:.5em;
      }
    }

    .description-section {
      max-width:900px;

      h2 {
        font-size:.8rem;
        font-weight:normal;
        color:rgba(255,255,255,.7);
        padding: 1rem 0 .5rem;
      }
    }

    .voting-section {

    }

  }
}
</style>
