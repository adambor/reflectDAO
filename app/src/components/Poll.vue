<template>
  <div class="poll">
    <div class="title">
      <h1>Current result</h1>
    </div>
    <div class="options">
        <label>
          <input name="proposal" type="radio" v-model="optionYes">
          <span class="custom-radio">
            <div class="dot"></div>
          </span>
          <div class="option-text">
            <div class="wrapper">
              Yes
              <span v-text="percentageYes"></span>
            </div>
            <div class="bar" :style="{width: percentYes + '%'}"></div>
          </div>
        </label>
        <label>
          <input name="proposal" type="radio" v-model="optionNo">
          <span class="custom-radio">
            <div class="dot"></div>
          </span>
          <div class="option-text">
            <div class="wrapper">
              No
              <span v-text="percentageNo"></span>
            </div>
            <div class="bar" :style="{width: percentNo + '%'}"></div>
          </div>
        </label>
      </div>
      <div class="call-to-action">
        <template v-if="alreadyVoted">
          <button disabled>You have already voted</button>
        </template>

        <template v-else>
          <button @click="vote()">Vote proposal</button>
        </template>
      </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { StaticEVMWallet } from "@/StaticEVMWallet";
import { ProposalDTO } from "@/dto/ProposalDTO";

@Options({
  data: function () {
    return {
      optionYes: false,
      optionNo: false
    }
  },
  props: {
    proposal: ProposalDTO,
    voteYes: Number,
    voteNo: Number,
    percentYes: Number,
    percentNo: Number,
    totalVotes: Number,
    alreadyVoted: Boolean,
    quorumPercent: Number
  },
  methods: {
    vote: async function () {
      if (this.optionYes || this.optionNo) {
        console.log( await StaticEVMWallet.wallet.voteForProposal(this.proposal.id, this.optionYes ? 1 : 0) );
      } else {
        console.log("Nope");
      }
    }
  },
  computed: {
    percentageYes: function () {
      return this.percentYes + "%";
    },
    percentageNo: function () {
      return this.percentNo + "%";
    }
  }
})
export default class Search extends Vue {
  voteYes!: number;
  voteNo!: number;
  percentYes!: number;
  percentNo!: number;
  totalVotes!: number;
  alreadyVoted!: boolean;
  quorumPercent!: number;
}
</script>

<style scoped lang="scss">
  .poll {
    width:100%;
    max-width:300px;
    background-color:transparent;
    border: 1px solid rgba(255,255,255,.05);
    border-radius:10px;
    box-sizing: border-box;

    .title {
      width:100%;
      text-align:left;
      border-bottom:1px solid rgba(255,255,255,.05);
      box-sizing: border-box;
      padding:.8rem;

      h1 {
        font-size:1.2rem;
        color:#fff;
      }
    }

    .options {
      box-sizing: border-box;
      padding:.8rem;

      label {
        display:flex;
        align-items:center;
        padding:.5rem;
        box-sizing: border-box;
        color:#fff;
        font-weight: bold;
        cursor:pointer;
        transition:all .2s;

        &:hover {
          .custom-radio {
            transition:all .2s;
            background-color:rgba(255,255,255,.02);
          }
        }
        
        input {
          position:absolute;
          visibility: hidden;

          &:checked~.custom-radio {
            .dot {
              width:10px;
              height:10px;
              opacity:1;
              transition:all .2s;
            }
          }

        }

        .custom-radio {
          display:flex;
          justify-content: center;
          align-items:center;
          cursor:pointer;
          min-width:20px;
          min-height:20px;
          border-radius:100%;
          background-color:transparent;
          border: 1px solid rgba(255,255,255,.05);
          margin-right:.5rem;

          .dot {
            width:0;
            height:0;
            background-color:rgba(255,255,255,.2);
            border-radius:100%;
            opacity:0;
            transition:all .2s;
          }

        }

        .bar {
          width:100%;
          height:3px;
          background-color:rgba(255,255,255,.1);
          border-radius:2px;
        }

        .option-text {
          text-align:left;
          width:100%;

          .wrapper {
            display:flex;
            justify-content: space-between;
          }

        }

      }

    }

    .call-to-action {
      box-sizing:border-box;
      padding: .5em;

      button {
        width:100%;
        padding:1rem;
        background-color:transparent;
        border-radius:10px;
        outline-style: none;
        border:0;
        border:1px solid rgba(255,255,255,.05);
        font-weight: bold;
        color:#fff;
        cursor:pointer;
        transition: all .2s;

        &:disabled {
          cursor:default;
          &:hover {
            background:transparent;
          }
        }

        &:hover {
          background-color:rgba(255,255,255,.02);
          transition: all .2s;
        }
      }
    }

  }
</style>
