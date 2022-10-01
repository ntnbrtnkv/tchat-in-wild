// import { useStorage, createGlobalState } from "@vueuse/core";
//
// export const favorite = createGlobalState(
//   () => useStorage<string[]>("favorite", [])
// );

import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import type { SimpleEmote } from "@/types/Emote";

const EMOTES_CAPACITY = 8;

export const useFavorite = defineStore("favorite", {
  state: () => ({
    channels: useLocalStorage<Set<string>>("favorite-channels", new Set([])),
    emotes: useLocalStorage<SimpleEmote[]>("favorite-emotes", []),
  }),
  getters: {
    list(state) {
      return [...state.channels.values()];
    },
    emote_list(state) {
      return state.emotes;
    },
  },
  actions: {
    add(channel: string) {
      this.channels.add(channel);
    },
    remove(channel: string) {
      this.channels.delete(channel);
    },
    has(channel: string) {
      return this.channels.has(channel);
    },
    visitEmote(emote: SimpleEmote) {
      const found = this.emotes.findIndex(({ url }) => url === emote.url);
      if (found !== -1) {
        this.emotes.splice(found, 1);
      }
      this.emotes.unshift(emote);

      if (this.emotes.length > EMOTES_CAPACITY) {
        this.emotes.splice(
          EMOTES_CAPACITY - 1,
          this.emotes.length - EMOTES_CAPACITY
        );
      }
    },
  },
});
