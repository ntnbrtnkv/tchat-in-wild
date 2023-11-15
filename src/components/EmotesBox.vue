<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import type { SimpleEmote } from "@/types/Emote";
import EmoteButton from "@/components/EmoteButton.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EmotesBox",
  data() {
    return {
      search: "",
      showAll: false,
    };
  },
  components: { EmoteButton },
  methods: {
    filteredEmotes(substring: string, emotes: SimpleEmote[]) {
      const loweredSubstr = substring.toLowerCase();
      if (loweredSubstr.length < 2 && !this.showAll) return [];
      return emotes.filter((emote) =>
        emote.name.toLowerCase().includes(loweredSubstr)
      );
    },
    setShowAll() {
      this.showAll = true;
    },
  },
  computed: {
    globalEmotes(): SimpleEmote[] {
      const { globalEmotes } = useEmotesStore();
      return globalEmotes.map((emote) => ({
        name: emote.code,
        channel: this.$route.params.channel as string,
        url: emote.urls[0].url,
      }));
    },
    channelEmotes(): SimpleEmote[] {
      const { channelEmotes } = useEmotesStore();
      return channelEmotes.map((emote) => ({
        name: emote.code,
        channel: this.$route.params.channel as string,
        url: emote.urls[0].url,
      }));
    },
  },
});
</script>

<template>
  <div class="container">
    <section>
      <h3>Emote name</h3>
      <label>
        Type al least 2 symbols to show filtered emotes
        <input v-model="search" autofocus />
      </label>
      <button
        class="showAll"
        v-if="!showAll && search.length === 0"
        @click="setShowAll"
      >
        Show all
      </button>
    </section>
    <section>
      <h2>Global emotes</h2>
      <ul>
        <EmoteButton
          v-for="emote in filteredEmotes(search, globalEmotes)"
          :key="emote.name"
          :emote="emote"
        />
      </ul>
    </section>
    <section>
      <h2>Channel emotes</h2>
      <ul>
        <EmoteButton
          v-for="emote in filteredEmotes(search, channelEmotes)"
          :key="emote.name"
          :emote="emote"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.showAll {
  float: inline-end;
  background-color: transparent;
  border: 0;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: underline;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
section {
  margin-bottom: 24px;
}
h2 {
  text-align: center;
  margin-bottom: 12px;
}
ul {
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
}
li {
  margin-right: 1em;
}
label {
  display: flex;
  flex-direction: column;
}
</style>
