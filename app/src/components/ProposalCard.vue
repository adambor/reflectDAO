<template>
  <div class="proposal">
    <div class="header">
      <div class="pic"></div>
      <div class="profile-name">
        <p class="title" v-text="profile_name"></p>
        <p class="subtitle">Ends in 1 day</p>
      </div>
      <div class="badge-wrapper">
        <Badge />
      </div>
    </div>
    <div class="body">
      <p class="proposal-title">Proposal title</p>
      <h1 v-text="title"></h1>
      <p class="proposal-description">Proposal description</p>
      <p v-text="proposal"></p>
      <p class="proposal-by">Proposed by</p>
      <p>reflectdao.eth</p>
    </div>
    <div class="call-to-action">
        <router-link to="/proposal/1">
          Read more <RightArrowIcon />
        </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Badge from "@/components/Badge.vue";
import RightArrowIcon from "@/components/icons/RightArrowIcon.vue";

@Options({
  components: {
    Badge,
    RightArrowIcon
  },
  data: function () {
    return {
      profile_name: "ReflectDAO",
      title: "[ARFC] Add rETH to Aave V3 Arbitrum Liquidity Pool",
      proposal: "rETH is listed on Aave v3 Ethereum and has over $20M of deposits. Rocket Pools is expanding its support for rETH across the L2 ecosystem, first Optimism, now Arbitrum and soon Polygon. There are currently only Chainlink Oracles for Arbitrum and Ethereum."
    }
  },
  props: {
    profile_name: String,
    title: String,
    proposal: String
  },
})
export default class ProposalCard extends Vue {
}
</script>

<style scoped lang="scss">

  .proposal {
    width: 100%;
    max-width: 300px;
    min-height:300px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,.05);
    box-shadow: 0 0 20px rgba(0,0,0,.05);
    cursor:pointer;
    transition: all .2s;
    margin-bottom:1rem;

    &:hover {
      transform:scale(1.005);
      transition:all .2s;

      .call-to-action {
        a {
          transition: all .2s;
          color:rgba(255,255,255,1);
        }
      }
    }

    .header {
      position:relative;
      display:flex;
      align-items:center;
      box-sizing: border-box;
      padding:1rem;

      .pic {
        width:40px;
        height:40px;
        background-color:rgba(255,255,255,.05);
        border-radius:100%;
      }

      .profile-name {
        padding: 0 .8em;

        .title {
          text-align: left;
          font-weight:bold;
          color:#fff;
          font-size:1rem;
        }

        .subtitle {
          font-size:.8rem;
          color:rgba(255,255,255,.4);
          text-align:left;
        }
      }

      .badge-wrapper {
        position:absolute;
        top:0;
        right:0;
        padding:inherit;
      }

    }

    .body {
      font-size:.5rem;
      color:#fff;
      box-sizing:border-box;
      padding: .5rem 1rem;

      h1 {
        text-align:left;
      }

      .proposal {
        &-title, &-description, &-by {
          font-size:.8rem;
          color:rgba(255,255,255,.4);
          text-align:left;
          margin-bottom:.3rem;
        }
        &-description, &-by {
          margin-top:1rem;
        }
      }

      p {
        font-size:.7rem;
        text-align: left;
      }

    }

    .call-to-action {
      display: flex;
      justify-content: flex-end;
      padding:0 1rem 1rem;
      box-sizing: border-box;

        a {
          display:flex;
          align-items: center;
          color:rgba(255,255,255,.5);
          text-decoration: none;
          font-size:.8rem;
          text-transform: uppercase;
          font-weight: bold;
          transition: all .2s;

          &:hover {
            transition: all .2s;
            color:rgba(255,255,255,1);
          }

          svg {
            width:20px;
            margin-left:.3rem;
          }
        }
    }

  }
  
</style>
