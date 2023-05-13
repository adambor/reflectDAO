<template>
    <template v-if="connected">
      ...
    </template>

    <template v-else>
      <button>Connect wallet</button>
    </template>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    connected: false
  },
})
export default class Wallet extends Vue {
}
</script>

<style scoped lang="scss">
  button {
    padding: .8rem 1.3rem;
    background-color:transparent;
    border:0;
    border:2px solid rgba(255,255,255,.1);
    border-radius:10px;
    box-sizing: border-box;
    color:rgba(255,255,255,.8);
  }

  select {
    width:100%;
    max-width:300px;
    border:0;
    background-color:transparent;
    border: 1px solid rgba(255,255,255,.1);
    padding: 1rem 2rem;
    outline-style: none;
    color:#fff;
    box-sizing: border-box;
  }

</style>
