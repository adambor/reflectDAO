<template>
  <div class="header">
    <div class="header-wrapper">
      <router-link to="/">
        reflect<span>DAO</span>
      </router-link>

      <Search />

      <Wallet />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Search from "@/components/Search.vue";
import Wallet from "@/components/Wallet.vue";

@Options({
  components: {
    Wallet,
    Search
  },
  props: {
  },
})
export default class Header extends Vue {
}
</script>

<style scoped lang="scss">
  .header {
    border-bottom: 1px solid rgba(255,255,255,.05);

    a {
      font-weight:bold;
      color:#FFCE4D;
      font-size:1.1rem;
      letter-spacing: -.5px;
      text-decoration:none;
    }

    .header-wrapper {
      width:100%;
      height:70px;
      max-width:1000px;
      margin:0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding:1em;
      box-sizing: border-box;

      .title {
        font-weight:bold;
        letter-spacing:-.5px;
        font-size:1.3rem;
        color:#000;
      }
    }
  }
</style>
