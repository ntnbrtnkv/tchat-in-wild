<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import { defineComponent } from "vue";
import type { IEmote } from "@/types/Emote";

export default defineComponent({
  name: "EmoteView",
  data(): {
    emote: IEmote | undefined;
  } {
    return {
      emote: undefined,
    };
  },
  mounted() {
    const { getEmote } = useEmotesStore();

    const { emote } = this.$route.params;

    if (typeof emote === "string") {
      this.emote = getEmote(emote);
    }
  },
});
</script>

<template>
  <ul v-if="emote">
    <li v-for="url in emote.urls" :key="url.size">
      <span class="label">{{ url.size }}</span>
      <img :src="url.url" alt="url.size" />
    </li>
  </ul>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
}
ul {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
}
li {
  margin-bottom: 2em;
}
.label {
  position: fixed;
  margin-left: -2em;
}
</style>
