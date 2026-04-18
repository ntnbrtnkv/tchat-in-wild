<script lang="ts">
import { defineComponent } from "vue";
import FavoriteChannels from "@/components/FavoriteChannels.vue";

export default defineComponent({
  name: "HomeView",
  components: { FavoriteChannels },
  data() {
    return {
      channelInput: "",
    };
  },
  created() {
    document.title = "TChat in wild — Twitch emote browser";
  },
  methods: {
    goToChannel() {
      const channel = this.channelInput.trim().toLowerCase();
      if (channel) {
        this.$router.push({ name: "emotes", params: { channel } });
      }
    },
  },
});
</script>

<template>
  <div class="home">
    <h1 class="title">TChat in wild</h1>
    <p class="subtitle">
      Browse Twitch, BetterTTV, FrankerFaceZ & 7TV emotes for any channel
    </p>

    <form class="search-form" @submit.prevent="goToChannel">
      <label for="channel-input" class="input-label">
        Enter a Twitch channel name to explore its emotes
      </label>
      <div class="input-row">
        <input
          id="channel-input"
          v-model="channelInput"
          type="text"
          placeholder="e.g. lirik, xqc, shroud..."
          autofocus
          autocomplete="off"
        />
        <button type="submit" :disabled="!channelInput.trim()">
          Browse emotes
        </button>
      </div>
    </form>

    <FavoriteChannels />

    <section class="how-it-works">
      <h2>How it works</h2>
      <ol>
        <li>Type a Twitch channel name above and press <strong>Browse emotes</strong></li>
        <li>See all emotes grouped by provider (Twitch, BTTV, FFZ, 7TV)</li>
        <li>Click any emote to view it in all available sizes</li>
        <li>Star channels to save them as favorites for quick access</li>
      </ol>
    </section>

    <p class="tip">
      You can also go directly to
      <code>/channelname</code> in the URL
    </p>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 32px;
  font-size: 1.05rem;
}

.search-form {
  margin-bottom: 32px;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.6;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.input-row input {
  padding: 10px 14px;
  font-size: 1rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
  flex: 1;
  max-width: 320px;
}

.input-row button {
  padding: 10px 20px;
  font-size: 1rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
}

.input-row button:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.input-row button:disabled {
  opacity: 0.4;
  cursor: default;
}

.how-it-works {
  text-align: left;
  margin: 32px auto;
  padding: 20px 24px;
  border: 1px solid var(--color-border-hover);
  border-radius: 10px;
  background: var(--color-background-soft);
}

.how-it-works h2 {
  text-align: center;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.how-it-works ol {
  padding-left: 1.5em;
  line-height: 1.8;
}

.tip {
  font-size: 0.85rem;
  opacity: 0.5;
  margin-top: 16px;
}

.tip code {
  background: var(--color-background-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
