import { defineStore } from "pinia";
import { EmotesAPI } from "@/api/emotes";
import type { IEmote } from "@/types/Emote";

type IState = {
  globalEmotes: IEmote[];
  channelEmotes: IEmote[];
  channel: string;
};

export const useEmotesStore = defineStore<
  "emotes",
  IState,
  {
    map: (state: IState) => Record<string, IEmote>;
    emotes: (state: IState) => IEmote[];
    getEmote: (state: IState) => (name: string) => IEmote | undefined;
  },
  {
    fetchGlobalEmotes: () => Promise<void>;
    fetchChannelEmotes: (channel: string) => Promise<void>;
    fetchEmotes: (channel: string) => Promise<void>;
  }
>({
  id: "emotes",
  state: () => ({
    globalEmotes: [],
    channelEmotes: [],
    channel: "",
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
    async fetchGlobalEmotes() {
      if (this.globalEmotes.length === 0) {
        const globalEmotes = await EmotesAPI.getGlobalEmotes();
        this.globalEmotes = [...new Set(globalEmotes)];
      }
    },
    async fetchChannelEmotes(channel: string) {
      if (this.channel !== channel) {
        this.channel = channel;
        const channelEmotes = await EmotesAPI.getChannelEmotes(channel);
        this.channelEmotes = [...new Set(channelEmotes)];
      }
    },
    async fetchEmotes(channel: string) {
      await Promise.all([
        this.fetchGlobalEmotes(),
        this.fetchChannelEmotes(channel),
      ]);
    },
  },
});
