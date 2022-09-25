import { createRouter, createWebHistory } from "vue-router";
import ChannelView from "@/views/ChannelView.vue";
import EmoteView from "@/views/EmoteView.vue";
import EmotesBox from "@/components/EmotesBox.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
