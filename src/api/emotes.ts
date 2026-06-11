import axios from "axios";
import type { IEmote } from "@/types/Emote";
import { EmoteProvider } from "@/types/Emote";

// ─── BTTV ────────────────────────────────────────────────────────────────────

interface BttvEmote {
  id: string;
  code: string;
  imageType: string;
}

interface BttvChannelResponse {
  channelEmotes: BttvEmote[];
  sharedEmotes: BttvEmote[];
}

function normalizeBttv(emote: BttvEmote): IEmote {
  return {
    provider: EmoteProvider.BTTV,
    code: emote.code,
    urls: [
      { size: "1x", url: `https://cdn.betterttv.net/emote/${emote.id}/1x` },
      { size: "2x", url: `https://cdn.betterttv.net/emote/${emote.id}/2x` },
      { size: "3x", url: `https://cdn.betterttv.net/emote/${emote.id}/3x` },
    ],
  };
}

// ─── FFZ ─────────────────────────────────────────────────────────────────────

interface FfzEmoticon {
  id: number;
  name: string;
  urls: Record<string, string | null>;
}

interface FfzSet {
  emoticons: FfzEmoticon[];
}

function toAbsoluteUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function normalizeFfz(emote: FfzEmoticon): IEmote {
  const urls: IEmote["urls"] = [];
  if (emote.urls["1"]) urls.push({ size: "1x", url: toAbsoluteUrl(emote.urls["1"]!) });
  if (emote.urls["2"]) urls.push({ size: "2x", url: toAbsoluteUrl(emote.urls["2"]!) });
  if (emote.urls["4"]) urls.push({ size: "4x", url: toAbsoluteUrl(emote.urls["4"]!) });
  return { provider: EmoteProvider.FFZ, code: emote.name, urls };
}

function normalizeFfzSets(sets: Record<string, FfzSet>): IEmote[] {
  return Object.values(sets).flatMap((set) => set.emoticons.map(normalizeFfz));
}

// ─── 7TV ─────────────────────────────────────────────────────────────────────

interface SevenTvEmote {
  id: string;
  name: string;
  data?: {
    host: {
      url: string;
      files: Array<{ name: string; format: string }>;
    };
  };
}

function normalizeSevenTv(emote: SevenTvEmote): IEmote | null {
  const host = emote.data?.host;
  if (!host) return null;
  const baseUrl = `https:${host.url}`;
  const urls: IEmote["urls"] = (["1x", "2x", "3x", "4x"] as const).flatMap((size) => {
    const file = host.files.find((f) => f.name === `${size}.webp`);
    return file ? [{ size, url: `${baseUrl}/${file.name}` }] : [];
  });
  return urls.length > 0 ? { provider: EmoteProvider.SevenTV, code: emote.name, urls } : null;
}

// ─── Twitch user ID via IVR (no OAuth required) ───────────────────────────────

async function getTwitchUserId(channel: string): Promise<string | null> {
  try {
    const { data } = await axios.get<Array<{ id: string }>>(
      `https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(channel)}`
    );
    return data[0]?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

class Emotes {
  async getGlobalEmotes(): Promise<IEmote[]> {
    const [bttv, ffz, sevenTv] = await Promise.allSettled([
      axios.get<BttvEmote[]>("https://api.betterttv.net/3/cached/emotes/global"),
      axios.get<{ sets: Record<string, FfzSet>; default_sets: number[] }>(
        "https://api.frankerfacez.com/v1/set/global"
      ),
      axios.get<{ emotes: SevenTvEmote[] }>("https://7tv.io/v3/emote-sets/global", { timeout: 5000 }),
    ]);

    const emotes: IEmote[] = [];

    if (bttv.status === "fulfilled") {
      emotes.push(...bttv.value.data.map(normalizeBttv));
    }
    if (ffz.status === "fulfilled") {
      const { sets, default_sets } = ffz.value.data;
      const filtered = Object.fromEntries(
        Object.entries(sets).filter(([id]) => default_sets.includes(Number(id)))
      );
      emotes.push(...normalizeFfzSets(filtered));
    }
    if (sevenTv.status === "fulfilled") {
      emotes.push(
        ...sevenTv.value.data.emotes
          .map(normalizeSevenTv)
          .filter((e): e is IEmote => e !== null)
      );
    }

    return emotes;
  }

  async getChannelEmotes(channel: string): Promise<IEmote[]> {
    const userId = await getTwitchUserId(channel);

    const requests: Promise<IEmote[]>[] = [
      // FFZ works by channel name directly
      axios
        .get<{ sets: Record<string, FfzSet> }>(
          `https://api.frankerfacez.com/v1/room/${encodeURIComponent(channel)}`
        )
        .then(({ data }) => normalizeFfzSets(data.sets))
        .catch(() => []),
    ];

    if (userId) {
      requests.push(
        // BTTV channel + shared emotes
        axios
          .get<BttvChannelResponse>(
            `https://api.betterttv.net/3/cached/users/twitch/${userId}`
          )
          .then(({ data }) => [
            ...data.channelEmotes.map(normalizeBttv),
            ...data.sharedEmotes.map(normalizeBttv),
          ])
          .catch(() => []),
        // 7TV channel emotes
        axios
          .get<{ emote_set: { emotes: SevenTvEmote[] } }>(
            `https://7tv.io/v3/users/twitch/${userId}`,
            { timeout: 5000 }
          )
          .then(({ data }) =>
            data.emote_set.emotes
              .map(normalizeSevenTv)
              .filter((e): e is IEmote => e !== null)
          )
          .catch(() => [])
      );
    }

    const results = await Promise.all(requests);
    return results.flat();
  }
}

export const EmotesAPI = new Emotes();
