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
  } {
    return {
      emote: undefined,
      type: "loading...",
      animated: false,
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
    imageLoaded(index: number) {
      if (index !== 0) return;

      (async () => {
        if (this.emote) {
          let blob;
          const url = this.emote.urls[0].url;
          let type;
          let text = "ANIM";

          if (url.includes(".webp")) {
            type = "image/webp";
          } else {
            try {
              blob = await this.getImageBlob(url);
            } catch (error) {
              if (
                (error as Error)?.message ===
                "NetworkError when attempting to fetch resource."
              ) {
                blob = await this.getImageBlob(await TChatAPI.proxy(url));
              }
            }
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
                  const newUrl = await TChatAPI.convertToGif(url.url);
                  url.url = newUrl;
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
      }
    }
  },
});
</script>

<template>
  <h4>Filetype: {{ type }}</h4>
  <ul v-if="emote">
    <li v-for="(url, index) in emote.urls" :key="url.size">
      <span class="label">{{ url.size }}</span>
      <img :src="url.url" alt="url.size" @load="imageLoaded(index)" />
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
