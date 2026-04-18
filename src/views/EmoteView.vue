<script lang="ts">
import { useEmotesStore } from "@/stores/emotes";
import { defineComponent } from "vue";
import { TChatAPI } from "@/api/tchat";
import type { IEmote } from "@/types/Emote";
import { useFavorite } from "@/stores/favorite";

import star from "@/assets/icons/star.svg";
import star_filled from "@/assets/icons/star_filled.svg";

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
    toggleEmoteFav() {
      if (!this.emote) return;
      const emoteData = {
        name: this.emote.code,
        channel: this.$route.params.channel as string,
        url: this.emote.urls[0].url,
      };
      if (this.favs.hasEmote(emoteData)) {
        this.favs.removeEmote(emoteData);
      } else {
        this.favs.visitEmote(emoteData);
      }
    },
    setMetaTag(property: string, content: string) {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    },
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
        this.urls = this.emote.urls.map(({ url }) => TChatAPI.proxy(url));

        // Set page title and OG meta tags
        document.title = `${emote} — ${channel} — TChat in wild`;
        this.setMetaTag("og:title", emote);
        this.setMetaTag("og:description", `Emote on ${channel}'s channel — TChat in wild`);
        this.setMetaTag("og:image", this.emote.urls[this.emote.urls.length - 1].url);
        this.setMetaTag("og:url", window.location.href);
      }
    }
  },
  beforeUnmount() {
    // Clean up OG meta tags when leaving the page
    ["og:title", "og:description", "og:image", "og:url"].forEach((prop) => {
      const el = document.querySelector(`meta[property="${prop}"]`);
      if (el) el.remove();
    });
  },
  computed: {
    isEmoteFav(): boolean {
      if (!this.emote) return false;
      return this.favs.hasEmote({
        name: this.emote.code,
        channel: this.$route.params.channel as string,
        url: this.emote.urls[0].url,
      });
    },
    emoteFavIcon(): string {
      return this.isEmoteFav ? star_filled : star;
    },
  },
});
</script>

<template>
  <div v-if="emote" class="emote-detail">
    <h2 class="emote-name">
      {{ emote.code }}
      <button @click="toggleEmoteFav" class="emote-fav" :title="isEmoteFav ? 'Remove from favorite emotes' : 'Add to favorite emotes'">
        <img alt="favorite" :src="emoteFavIcon" />
      </button>
    </h2>
    <p class="emote-meta">Filetype: {{ type }}</p>

    <section class="sizes-grid">
      <span class="grid-header">Size</span>
      <span class="grid-header">Original</span>
      <span class="grid-header">Converted</span>
      <template v-for="(url, index) in emote.urls" :key="url.size">
        <span class="size-label">{{ url.size }}</span>
        <a :href="url.url" target="_blank" rel="noopener" class="img-link">
          <img :src="url.url" title="Original image — click to open full size" alt="Original image" />
        </a>
        <a :href="urls[index]" target="_blank" rel="noopener" class="img-link">
          <img
            :src="urls[index]"
            alt="Converted image"
            title="Converted image — click to open full size"
            @load="imageLoaded(index, urls[index])"
          />
        </a>
      </template>
    </section>

    <p class="tip">Click any image to open it in full size in a new tab</p>
  </div>

  <div v-else class="not-found">
    <h2>Emote not found</h2>
    <p>
      The emote <strong>{{ $route.params.emote }}</strong> was not found on this channel.
      It may have been removed or renamed.
    </p>
    <router-link :to="{ name: 'emotes', params: { channel: $route.params.channel } }">
      ← Browse all emotes for {{ $route.params.channel }}
    </router-link>
  </div>
</template>

<style scoped>
.emote-detail {
  text-align: center;
}
.emote-name {
  font-size: 1.5rem;
  margin-bottom: 4px;
}
.emote-fav {
  background-color: transparent;
  border: 0;
  cursor: pointer;
  vertical-align: middle;
  margin-left: 4px;
}
.emote-meta {
  opacity: 0.6;
  font-size: 0.9rem;
  margin-bottom: 24px;
}
.sizes-grid {
  display: grid;
  grid-template-columns: repeat(3, min-content);
  grid-auto-rows: auto;
  justify-content: center;
  align-items: center;
  grid-gap: 8px;
}
.sizes-grid > *:nth-child(3n-1) {
  justify-self: end;
}
.grid-header {
  font-weight: bold;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.5;
}
.size-label {
  opacity: 0.7;
}
.img-link {
  display: inline-block;
}
.img-link:hover {
  opacity: 0.8;
}
.tip {
  margin-top: 20px;
  font-size: 0.8rem;
  opacity: 0.4;
}
.not-found {
  text-align: center;
  margin-top: 48px;
}
.not-found h2 {
  margin-bottom: 8px;
}
.not-found p {
  opacity: 0.6;
  margin-bottom: 16px;
}
.not-found a {
  text-decoration: none;
}
.not-found a:hover {
  text-decoration: underline;
}
</style>
