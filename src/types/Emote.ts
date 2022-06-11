export type IEmote = {
  provider: number;
  code: string;
  urls: Array<{
    size: "1x" | "2x" | "3x" | "4x";
    url: string;
  }>;
};

export type SimpleEmote = {
  url: string;
  name: string;
};
