<template>
  <div class="search">
      <input type="text" v-model="search" placeholder="Search a proposal...">
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  data: function () {
    return {
      search: "",
    }
  },
})
export default class Search extends Vue {
  search!: string;
}
</script>

<style scoped lang="scss">
  .search {
    flex-grow: 1;

    input {
      width:100%;
      max-width:300px;
      border:0;
      border-radius:30px;
      padding:.7rem 1rem;
      outline:none;
      border: 1px solid rgba(255,255,255,.05);
      background-color:transparent;
      transition: all .2s;
      color:#fff;
      box-sizing:border-box;

      &:hover {
        background-color:rgba(255,255,255,.02);
      }

      &:focus {
        max-width:400px;
        transition: all .2s;
      }

      &::placeholder {
        color:rgba(255,255,255,.3);
      }
        
    }
  }
</style>
