import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ChannelView from "@/views/ChannelView.vue";
import EmoteView from "@/views/EmoteView.vue";
import EmotesBox from "@/components/EmotesBox.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/:channel",
      name: "channel",
      component: ChannelView,
      children: [
        {
          path: "",
          name: "emotes",
          component: EmotesBox,
        },
        {
          path: ":emote",
          name: "emote",
          component: EmoteView,
        },
      ],
    },
  ],
});

export default router;
