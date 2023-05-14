import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/proposal/:id",
    name: "proposal",
    component: () =>
      import("../views/ProposalView.vue"),
  },
  {
    path: "/lock",
    name: "lock",
    component: () =>
      import("../views/LockView.vue"),
  },
  {
    path: "/send",
    name: "send",
    component: () =>
      import("../views/SendView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
