import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./styles/main.scss";
import { TokenManager } from "reflectdao-lib";
TokenManager.load();

createApp(App).use(store).use(router).mount("#app");
