import { createRouter, createWebHistory } from "vue-router";
import ChannelView from "../views/ChannelView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/:id",
      name: "channel",
      component: ChannelView,
    },
  ],
});

export default router;
