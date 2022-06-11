import { defineStore } from "pinia";
import { EmotesAPI } from "@/api/emotes";
import type { IEmote } from "@/types/Emote";

type IState = { globalEmotes: IEmote[]; channelEmotes: IEmote[] };

export const useEmotesStore = defineStore<
  "emotes",
  IState,
  {
    map: (state: IState) => Record<string, IEmote>;
    emotes: (state: IState) => IEmote[];
    getEmote: (state: IState) => (name: string) => IEmote | undefined;
  },
  {
    fetchEmotes: (channel: string) => Promise<void>;
  }
>({
  id: "emotes",
  state: () => ({
    globalEmotes: [],
    channelEmotes: [],
  }),
  getters: {
    map() {
      return this.emotes.reduce<Record<string, IEmote>>((acc, emote) => {
        acc[emote.code] = emote;
        return acc;
      }, {});
    },
    emotes(state) {
      const emotes = [...state.globalEmotes, ...state.channelEmotes];
      return [...new Set(emotes)];
    },
    getEmote() {
      return (name: string) => this.map[name];
    },
  },
  actions: {
    async fetchEmotes(channel: string) {
      const [globalEmotes, channelEmotes] = await Promise.all([
        EmotesAPI.getGlobalEmotes(),
        EmotesAPI.getChannelEmotes(channel),
      ]);

      this.globalEmotes = [...new Set(globalEmotes)];
      this.channelEmotes = [...new Set(channelEmotes)];
    },
  },
});
