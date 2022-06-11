<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import type { SimpleEmote } from "@/types/Emote";
import EmoteButton from "@/components/EmoteButton.vue";

function filteredEmotes(substring: string, emotes: SimpleEmote[]) {
  const loweredSubstr = substring.toLowerCase();
  return emotes.filter((emote) =>
    emote.name.toLowerCase().includes(loweredSubstr)
  );
}

export default {
  name: "EmotesBox",
  data() {
    return {
      search: "",
    };
  },
  components: { EmoteButton },
  methods: {
    filteredEmotes,
  },
  computed: {
    globalEmotes(): SimpleEmote[] {
      const { globalEmotes } = useEmotesStore();
      return globalEmotes.map((emote) => ({
        name: emote.code,
        url: emote.urls[0].url,
      }));
    },
    channelEmotes(): SimpleEmote[] {
      const { channelEmotes } = useEmotesStore();
      return channelEmotes.map((emote) => ({
        name: emote.code,
        url: emote.urls[0].url,
      }));
    },
  },
};
</script>

<template>
  <div>
    <input v-model="search" />
    <h2>Global emotes</h2>
    <ul>
      <EmoteButton
        v-for="emote in filteredEmotes(search, globalEmotes)"
        :key="emote.name"
        :emote="emote"
      />
    </ul>

    <h2>Channel emotes</h2>
    <ul>
      <EmoteButton
        v-for="emote in filteredEmotes(search, channelEmotes)"
        :key="emote.name"
        :emote="emote"
      />
    </ul>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
}
li {
  margin-right: 1em;
}
</style>
