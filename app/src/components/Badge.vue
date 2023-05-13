<template>
  <div class="badge">
    <p v-text="text"></p>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  data: function () {
    return {
      text: "Active",
    }
  },
})
export default class Search extends Vue {
  search!: string;
}
</script>

<style scoped lang="scss">
  .badge {
    width:100%;
    max-width:100px;
    border-radius:1rem;
    background-color:var(--approve-color);
    font-size:.8rem;
    padding: .2rem 1rem;
    box-sizing: border-box;
    color:#fff;
  }
</style>
