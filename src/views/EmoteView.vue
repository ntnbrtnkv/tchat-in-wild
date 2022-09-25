<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import { defineComponent } from "vue";
import { TChatAPI } from "@/api/tchat";
import type { IEmote } from "@/types/Emote";

export default defineComponent({
  name: "EmoteView",
  data(): {
    emote: IEmote | undefined;
    type: string;
    animated: boolean;
  } {
    return {
      emote: undefined,
      type: "loading...",
      animated: false,
    };
  },
  methods: {
    async getImageBlob(link: string) {
      const response = await fetch(link);
      return response.blob();
    },
  },
  mounted() {
    const { getEmote } = useEmotesStore();

    const { emote } = this.$route.params;

    if (typeof emote === "string") {
      this.emote = getEmote(emote);

      (async () => {
        if (this.emote) {
          const blob = await this.getImageBlob(this.emote.urls[0].url);
          const text = await blob.text();
          const type = blob.type;
          if (type === "image/webp") {
            this.animated = text.includes("ANIM");

            if (this.animated) {
              await Promise.all(
                this.emote.urls.map(async (url) => {
                  url.url = await TChatAPI.convertToGif(url.url);
                })
              );
            }
            this.type = type + "; " + (this.animated ? "Animated" : "Static");
          } else {
            this.type = type;
          }
        }
      })();
    }
  },
});
</script>

<template>
  <h4>Filetype: {{ type }}</h4>
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
h4 {
  text-align: center;
  margin-bottom: 2em;
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
