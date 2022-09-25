<script lang="ts">
import type { SimpleEmote } from "@/types/Emote";
import type { PropType } from "vue";
import { useEmotesStore } from "@/stores/emotes";

export default {
  name: "EmoteButton",
  props: {
    emote: Object as PropType<SimpleEmote>,
  },

  methods: {
    onEmoteClick(emote: SimpleEmote) {
      const { getEmote } = useEmotesStore();

      const foundEmote = getEmote(emote.name);

      if (foundEmote) {
        // copyEmote(foundEmote);
      }
    },
  },
};
</script>

<template>
  <li @click="onEmoteClick(emote)">
    <router-link
      :to="{
        name: 'emote',
        params: { channel: $route.params.channel, emote: emote.name },
      }"
    >
      <img
        :src="emote.url"
        :alt="emote.name"
        :title="emote.name"
        loading="lazy"
      />
    </router-link>
  </li>
</template>

<style scoped>
li:hover {
  background-color: var(--color-hover);
  cursor: pointer;
}
</style>
