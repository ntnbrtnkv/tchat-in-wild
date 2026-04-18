export enum EmoteProvider {
  Twitch = 1,
  BTTV = 2,
  FFZ = 3,
  SevenTV = 4,
}

export const ProviderNames: Record<EmoteProvider, string> = {
  [EmoteProvider.Twitch]: "Twitch",
  [EmoteProvider.BTTV]: "BetterTTV",
  [EmoteProvider.FFZ]: "FrankerFaceZ",
  [EmoteProvider.SevenTV]: "7TV",
};

export type IEmote = {
  provider: EmoteProvider;
  code: string;
  urls: Array<{
    size: "1x" | "2x" | "3x" | "4x";
    url: string;
  }>;
};

export type SimpleEmote = {
  url: string;
  name: string;
  channel: string;
};
