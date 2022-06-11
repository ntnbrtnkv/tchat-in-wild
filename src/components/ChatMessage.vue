<script lang="ts">
import { defineComponent, ref } from "vue";
// import twemoji from "twemoji";
import html2canvas from "html2canvas";
import { useEmotesStore } from "@/stores/emotes";
import { copyEmote } from "@/utils/copyEmote";
import type { SimpleEmote } from "@/types/Emote";

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup() {
    const wrapper = ref<HTMLElement | null>(null);

    return {
      wrapper,
    };
  },
  methods: {
    click() {
      const { getEmote } = useEmotesStore();

      if (
        this.parsedText.length === 1 &&
        typeof this.parsedText[0] !== "string"
      ) {
        const emote = getEmote(this.parsedText[0].name);
        if (emote) {
          copyEmote(emote);
        }
      } else {
        if (this.wrapper) {
          html2canvas(this.wrapper).then(function (canvas) {
            canvas.toBlob((blob) => {
              if (!blob) return;
              // eslint-disable-next-line no-undef
              const item = new ClipboardItem({ "image/png": blob });
              navigator.clipboard.write([item]);
            });
          });
        }
      }
    },
  },
  computed: {
    parsedText(): Array<SimpleEmote | string> {
      const { getEmote } = useEmotesStore();

      return this.text
        .split(" ")
        .map((word: string) => {
          const emote = getEmote(word);

          if (!emote) return word;
          return {
            url: emote.urls[0].url,
            name: emote.code,
          } as SimpleEmote;
        })
        .reduce<Array<SimpleEmote | string>>((acc, word) => {
          if (acc.length === 0) return [word];

          const prevIndex = acc.length - 1;
          const prev = acc[prevIndex];

          const isPrevString = typeof prev === "string";
          const isWordString = typeof word === "string";

          if (isPrevString && isWordString) {
            acc[prevIndex] = `${prev} ${word}`;
          } else {
            if (isPrevString) {
              acc[prevIndex] = `${acc[prevIndex]} `;
            } else {
              word = ` ${word}`;
            }

            acc.push(word);
          }

          return acc;
        }, []);
      // Todo: uncomment for twitter emoji
      // .map((word) => (typeof word === "string" ? twemoji.parse(word) : word));
    },
  },
});
</script>

<template>
  <div class="wrapper" ref="wrapper" @click="click">
    <span class="message">
      <template v-for="word in parsedText" :key="word.name || word">
        <span v-if="typeof word === 'string'" v-html="word" />
        <div v-else class="emote-button">
          <img
            class="twitch-emote"
            :src="word.url"
            :alt="word.name"
            :title="word.name"
            loading="lazy"
          />
        </div>
      </template>
    </span>
  </div>
</template>

<style>
.emoji {
  width: 1.5em;
  height: 1.5em;
}
</style>

<style scoped>
.wrapper {
  overflow-wrap: anywhere;
  padding: 0.5rem 2rem;
  word-wrap: break-word;
  line-height: 20px;
  background-color: var(--color-background);
}

.wrapper:hover {
  background-color: var(--color-hover);
}

.message {
  font-weight: 400;
  border: 0;
  margin: 0;
  padding: 0;
  vertical-align: baseline;
}

.emote-button {
  display: inline;
}

.twitch-emote {
  max-height: 32px;
  max-width: 64px;
  vertical-align: middle;
  margin: -0.5rem 0;
}
</style>
