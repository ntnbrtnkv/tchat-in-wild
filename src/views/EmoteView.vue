<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import { defineComponent } from "vue";
import { TChatAPI } from "@/api/tchat";
import type { IEmote } from "@/types/Emote";
import { useFavorite } from "@/stores/favorite";

export default defineComponent({
  name: "EmoteView",
  data(): {
    emote: IEmote | undefined;
    type: string;
    animated: boolean;
    urls: string[];
  } {
    return {
      emote: undefined,
      type: "loading...",
      animated: false,
      urls: [],
    };
  },
  setup() {
    return {
      favs: useFavorite(),
    };
  },
  methods: {
    async getImageBlob(link: string) {
      const response = await fetch(link);
      return response.blob();
    },
    imageLoaded(index: number, url: string) {
      if (index !== 0) return;

      (async () => {
        if (this.emote) {
          let blob;
          let type;
          let text = "ANIM";

          if (url.includes(".webp")) {
            type = "image/webp";
          } else {
            blob = await this.getImageBlob(url);
            if (!blob) {
              throw Error("Won`t be able to get image blob");
            }

            await blob.text();
            type = blob.type;
          }

          if (type === "image/webp") {
            this.animated = text.includes("ANIM");

            if (this.animated) {
              await Promise.all(
                this.emote.urls.map(async (url) => {
                  url.url = TChatAPI.convertToGif(url.url);
                })
              );
            }
            this.type = type + "; " + (this.animated ? "Animated" : "Static");
          } else {
            this.type = type;
          }
        }
      })();
    },
  },
  mounted() {
    const { getEmote } = useEmotesStore();

    const { emote, channel } = this.$route.params;

    if (typeof emote === "string" && typeof channel === "string") {
      this.emote = getEmote(emote);
      if (this.emote) {
        this.favs.visitEmote({
          name: emote,
          channel,
          url: this.emote.urls[0].url,
        });
        this.urls = this.emote.urls.map(({ url }) => TChatAPI.proxy(url));
      }
    }
  },
});
</script>

<template>
  <h4>Filetype: {{ type }}</h4>
  <section v-if="emote">
    <span>Size</span>
    <span>Original</span>
    <span>Converted</span>
    <template v-for="(url, index) in emote.urls" :key="url.size">
      <td class="label">{{ url.size }}</td>
      <img :src="url.url" title="Original image" alt="Original image" />
      <img
        :src="urls[index]"
        alt="Converted image"
        title="Converted image"
        @load="imageLoaded(index, urls[index])"
      />
    </template>
  </section>
</template>

<style scoped>
h4 {
  text-align: center;
  margin-bottom: 2em;
}
section {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  grid-auto-rows: auto;
  justify-content: center;
  align-items: center;
  grid-gap: 8px;
}

section > *:nth-child(3n-1) {
  justify-self: end;
}
</style>
