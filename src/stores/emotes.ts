import { defineStore } from "pinia";
import { EmotesAPI } from "@/api/emotes";
import type { IEmote } from "@/types/Emote";
import type { EmoteProvider } from "@/types/Emote";

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
    channelEmotesByProvider: (
      state: IState
    ) => (provider: EmoteProvider) => IEmote[];
    globalEmotesByProvider: (
      state: IState
    ) => (provider: EmoteProvider) => IEmote[];
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
    channelEmotesByProvider() {
      return (provider: EmoteProvider) =>
        this.channelEmotes.filter((e) => e.provider === provider);
    },
    globalEmotesByProvider() {
      return (provider: EmoteProvider) =>
        this.globalEmotes.filter((e) => e.provider === provider);
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
        try {
          const channelEmotes = await EmotesAPI.getChannelEmotes(channel);
          this.channelEmotes = [...new Set(channelEmotes)];
        } catch (err) {
          this.channel = "";
          this.channelEmotes = [];
          throw err;
        }
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
