<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import type { SimpleEmote } from "@/types/Emote";
import { EmoteProvider, ProviderNames } from "@/types/Emote";
import EmoteButton from "@/components/EmoteButton.vue";
import { defineComponent } from "vue";

type ProviderSection = {
  provider: EmoteProvider;
  name: string;
  globalEmotes: SimpleEmote[];
  channelEmotes: SimpleEmote[];
};

const PROVIDERS = [
  EmoteProvider.Twitch,
  EmoteProvider.BTTV,
  EmoteProvider.FFZ,
  EmoteProvider.SevenTV,
] as const;

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
    mapEmotes(
      emotes: ReturnType<typeof useEmotesStore>["channelEmotes"]
    ): SimpleEmote[] {
      return emotes.map((emote) => ({
        name: emote.code,
        channel: this.$route.params.channel as string,
        url: emote.urls[0].url,
      }));
    },
  },
  computed: {
    providerSections(): ProviderSection[] {
      const store = useEmotesStore();
      return PROVIDERS.map((provider) => ({
        provider,
        name: ProviderNames[provider],
        globalEmotes: this.mapEmotes(store.globalEmotesByProvider(provider)),
        channelEmotes: this.mapEmotes(store.channelEmotesByProvider(provider)),
      })).filter((s) => s.globalEmotes.length > 0 || s.channelEmotes.length > 0);
    },
  },
});
</script>

<template>
  <div class="container">
    <section class="search-bar">
      <h3>Emote name</h3>
      <label>
        Type at least 2 symbols to show filtered emotes
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

    <div class="providers">
      <article
        v-for="section in providerSections"
        :key="section.provider"
        class="provider-card"
      >
        <h2 class="provider-title">{{ section.name }}</h2>

        <div
          v-if="section.globalEmotes.length"
          class="emote-group"
        >
          <h3 class="group-label">Global</h3>
          <ul>
            <EmoteButton
              v-for="emote in filteredEmotes(search, section.globalEmotes)"
              :key="emote.name"
              :emote="emote"
            />
          </ul>
        </div>

        <div
          v-if="section.channelEmotes.length"
          class="emote-group"
        >
          <h3 class="group-label">Channel</h3>
          <ul>
            <EmoteButton
              v-for="emote in filteredEmotes(search, section.channelEmotes)"
              :key="emote.name"
              :emote="emote"
            />
          </ul>
        </div>
      </article>
    </div>
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
.search-bar {
  margin-bottom: 28px;
  width: 100%;
  max-width: 500px;
}
.providers {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  align-self: center;
}
.provider-card {
  border: 1px solid var(--color-border-hover);
  border-radius: 10px;
  padding: 20px 24px;
  background: var(--color-background-soft);
}
.provider-title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 1.25rem;
}
.emote-group {
  margin-bottom: 12px;
}
.emote-group:last-child {
  margin-bottom: 0;
}
.group-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
  margin-bottom: 8px;
}
ul {
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  padding: 0;
}
li {
  margin: 0;
}
label {
  display: flex;
  flex-direction: column;
}
</style>
