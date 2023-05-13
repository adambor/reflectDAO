<template>
    <Header />
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Header from "@/components/Header.vue";

@Options({
  components: {
    Header
  },
})
export default class HomeView extends Vue {}
</script>

<style lang="scss" scoped>
  .home {
    .home-content {
      padding: 1rem;
      box-sizing:border-box;

      h1 {
        color:#fff;
        text-align: left;
        margin-bottom:1rem;
      }

    }
  }
</style>