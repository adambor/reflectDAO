<template>
  <div class="home-wrapper">
    <div class="nav-container">
      <div class="logo-container">
        <div class="logo-wrapper">
          <router-link to="/">
            <img alt="ReflectDAO Logo" src="@/assets/logo.png" class="logo" />
          </router-link>
        </div>
      </div>
      <nav>
        <router-link to="/">
          <DashboardIcon/>
        </router-link>
        <router-link to="/add">
          <PlusIcon/>
        </router-link>
      </nav>
    </div>
    <div class="body-container">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color:var(--background-color);
}

.home-wrapper {
  display:flex;
  width:100%;
  height:100vh;

  .nav-container {
    height:100%;
    border-right: 1px solid rgba(255,255,255,.05);

    .logo-container {
      display:flex;
      align-items: center;
      justify-content: center;
      box-sizing:border-box;
      padding: .3rem;

      .logo-wrapper {
        padding:10px;
        border-radius:100%;
        //background-color:#3C2081;
        width:40px;
        height:40px;

        .logo {
          width:40px;
        }
      }
    }

    nav {
      height:100%;
      padding: 15px;

      a {
        display:flex;
        align-items:center;
        justify-content: center;
        font-weight: bold;
        color: #2c3e50;
        text-decoration: none;
        padding: .5rem;
        box-sizing: border-box;
        border:1px solid rgba(255,255,255,.05);
        border-radius:100%;
        margin:0;

        &:not(:last-of-type) {
          margin-bottom:10px;
        }

        svg {
          max-width:30px;
        }

        &.router-link-exact-active {
          color: #C0E0F9;
        }
      }
    }

  }

  .body-container {
    flex-grow: 1;
    overflow-y:scroll;
  }

}
</style>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import DashboardIcon from "@/components/icons/DashboardIcon.vue";
import PlusIcon from "@/components/icons/PlusIcon.vue";

@Options({
  components: {
    DashboardIcon,
    PlusIcon
  },
})
export default class App extends Vue {}
</script>