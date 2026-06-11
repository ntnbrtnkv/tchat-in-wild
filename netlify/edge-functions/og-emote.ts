const BOT_UA_REGEX =
  /TelegramBot|Twitterbot|Discordbot|Slackbot|WhatsApp|facebookexternalhit|LinkedInBot|vkShare|Viber|Googlebot/i;

const CLOUDINARY_CLOUD = "drywhmegg";

type ApiEmote = {
  provider: number;
  code: string;
  urls: Array<{ size: string; url: string }>;
};

// ─── Direct provider helpers ──────────────────────────────────────────────────

async function getTwitchUserId(channel: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(channel)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ id: string }>;
    return data[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchBttvGlobal(): Promise<ApiEmote[]> {
  try {
    const res = await fetch("https://api.betterttv.net/3/cached/emotes/global");
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ id: string; code: string }>;
    return data.map((e) => ({
      provider: 2,
      code: e.code,
      urls: [
        { size: "1x", url: `https://cdn.betterttv.net/emote/${e.id}/1x` },
        { size: "2x", url: `https://cdn.betterttv.net/emote/${e.id}/2x` },
        { size: "3x", url: `https://cdn.betterttv.net/emote/${e.id}/3x` },
      ],
    }));
  } catch {
    return [];
  }
}

async function fetchBttvChannel(userId: string): Promise<ApiEmote[]> {
  try {
    const res = await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${userId}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      channelEmotes: Array<{ id: string; code: string }>;
      sharedEmotes: Array<{ id: string; code: string }>;
    };
    return [...data.channelEmotes, ...data.sharedEmotes].map((e) => ({
      provider: 2,
      code: e.code,
      urls: [
        { size: "1x", url: `https://cdn.betterttv.net/emote/${e.id}/1x` },
        { size: "2x", url: `https://cdn.betterttv.net/emote/${e.id}/2x` },
        { size: "3x", url: `https://cdn.betterttv.net/emote/${e.id}/3x` },
      ],
    }));
  } catch {
    return [];
  }
}

async function fetchFfzGlobal(): Promise<ApiEmote[]> {
  try {
    const res = await fetch("https://api.frankerfacez.com/v1/set/global");
    if (!res.ok) return [];
    const data = (await res.json()) as {
      sets: Record<string, { emoticons: Array<{ id: number; name: string; urls: Record<string, string | null> }> }>;
      default_sets: number[];
    };
    return data.default_sets.flatMap((setId) => {
      const set = data.sets[String(setId)];
      if (!set) return [];
      return set.emoticons.flatMap((e) => {
        const urls: ApiEmote["urls"] = [];
        if (e.urls["1"]) urls.push({ size: "1x", url: `https:${e.urls["1"]}` });
        if (e.urls["2"]) urls.push({ size: "2x", url: `https:${e.urls["2"]}` });
        if (e.urls["4"]) urls.push({ size: "4x", url: `https:${e.urls["4"]}` });
        return urls.length > 0 ? [{ provider: 3, code: e.name, urls }] : [];
      });
    });
  } catch {
    return [];
  }
}

async function fetchFfzChannel(channel: string): Promise<ApiEmote[]> {
  try {
    const res = await fetch(
      `https://api.frankerfacez.com/v1/room/${encodeURIComponent(channel)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      sets: Record<string, { emoticons: Array<{ id: number; name: string; urls: Record<string, string | null> }> }>;
    };
    return Object.values(data.sets).flatMap((set) =>
      set.emoticons.flatMap((e) => {
        const urls: ApiEmote["urls"] = [];
        if (e.urls["1"]) urls.push({ size: "1x", url: `https:${e.urls["1"]}` });
        if (e.urls["2"]) urls.push({ size: "2x", url: `https:${e.urls["2"]}` });
        if (e.urls["4"]) urls.push({ size: "4x", url: `https:${e.urls["4"]}` });
        return urls.length > 0 ? [{ provider: 3, code: e.name, urls }] : [];
      })
    );
  } catch {
    return [];
  }
}

async function fetchSevenTvGlobal(): Promise<ApiEmote[]> {
  try {
    const res = await fetch("https://7tv.io/v3/emote-sets/global");
    if (!res.ok) return [];
    const data = (await res.json()) as {
      emotes: Array<{ id: string; name: string; data?: { host: { url: string; files: Array<{ name: string; format: string }> } } }>;
    };
    return data.emotes.flatMap((e) => {
      const host = e.data?.host;
      if (!host) return [];
      const baseUrl = `https:${host.url}`;
      const urls: ApiEmote["urls"] = (["1x", "2x", "3x", "4x"] as const).flatMap((size) => {
        const file = host.files.find((f) => f.name === `${size}.webp`);
        return file ? [{ size, url: `${baseUrl}/${file.name}` }] : [];
      });
      return urls.length > 0 ? [{ provider: 4, code: e.name, urls }] : [];
    });
  } catch {
    return [];
  }
}

async function fetchSevenTvChannel(userId: string): Promise<ApiEmote[]> {
  try {
    const res = await fetch(`https://7tv.io/v3/users/twitch/${userId}`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      emote_set: { emotes: Array<{ id: string; name: string; data?: { host: { url: string; files: Array<{ name: string; format: string }> } } }> };
    };
    return data.emote_set.emotes.flatMap((e) => {
      const host = e.data?.host;
      if (!host) return [];
      const baseUrl = `https:${host.url}`;
      const urls: ApiEmote["urls"] = (["1x", "2x", "3x", "4x"] as const).flatMap((size) => {
        const file = host.files.find((f) => f.name === `${size}.webp`);
        return file ? [{ size, url: `${baseUrl}/${file.name}` }] : [];
      });
      return urls.length > 0 ? [{ provider: 4, code: e.name, urls }] : [];
    });
  } catch {
    return [];
  }
}

function getPreferredUrl(emote: ApiEmote): string {
  const preferred =
    emote.urls.find((u) => u.size === "4x")
    ?? emote.urls.find((u) => u.size === "3x")
    ?? emote.urls.find((u) => u.size === "2x")
    ?? emote.urls[0];
  return preferred?.url ?? "";
}

function is7tv(url: string): boolean {
  return url.includes("cdn.7tv.app");
}

function isBttv(url: string): boolean {
  return url.includes("cdn.betterttv.net");
}

function isTwitch(url: string): boolean {
  return url.includes("static-cdn.jtvnw.net");
}

function getTwitchAnimatedUrl(url: string): string {
  if (url.includes("/default/")) {
    return url.replace("/default/", "/animated/");
  }
  return url;
}

async function checkTwitchAnimated(url: string): Promise<boolean> {
  if (!url.includes("/default/")) return false;

  const animatedUrl = getTwitchAnimatedUrl(url);
  try {
    const res = await fetch(animatedUrl, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function toOgImageUrl(emote: ApiEmote): string {
  const url = getPreferredUrl(emote);
  if (!url) return "";

  try {
    const parsed = new URL(url);
    return `https://images.weserv.nl/?url=${parsed.host}${parsed.pathname}&w=1200&h=630&fit=contain&bg=1a1a2e&output=png&n=-1`;
  } catch {
    return url;
  }
}

async function toOgAnimatedUrl(emote: ApiEmote): Promise<string> {
  const url = getPreferredUrl(emote);
  if (!url) return "";

  // 7TV — check if .gif version exists (only animated emotes have it)
  if (is7tv(url)) {
    const gifUrl = url.replace(/\.webp$/, ".gif");
    try {
      const res = await fetch(gifUrl, { method: "HEAD" });
      if (res.ok) {
        // Return the raw gif URL for og:video (weserv mp4 conversion)
        return gifUrl;
      }
    } catch {
      // not animated
    }
    return "";
  }

  // BTTV — .gif URL means animated
  if (isBttv(url)) {
    return url.endsWith(".gif") ? url : "";
  }

  // Twitch — check if animated version exists
  if (isTwitch(url)) {
    const hasAnimated = await checkTwitchAnimated(url);
    if (hasAnimated) {
      return getTwitchAnimatedUrl(url);
    }
  }

  return "";
}

function buildOgHtml(
  channel: string,
  emoteName: string,
  imageUrl: string,
  videoUrl: string,
  siteUrl: string
): string {
  const videoTags = videoUrl
    ? `
  <meta property="og:video" content="${videoUrl}" />
  <meta property="og:video:type" content="video/mp4" />
  <meta property="og:video:width" content="1200" />
  <meta property="og:video:height" content="630" />`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="${emoteName}" />
  <meta property="og:description" content="Emote on ${channel}'s channel" />
  <meta property="og:site_name" content="TChat in wild" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />${videoTags}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${siteUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${emoteName}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <title>${emoteName} — ${channel} — TChat in wild</title>
</head>
<body></body>
</html>`;
}

export default async (request: Request) => {
  const ua = request.headers.get("user-agent") ?? "";

  // Only intercept bots
  if (!BOT_UA_REGEX.test(ua)) {
    return;
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  // Must match /:channel/:emote (exactly 2 segments)
  if (segments.length !== 2) {
    return;
  }

  const [channel, emoteName] = segments.map(decodeURIComponent);

  try {
    // Fetch user ID + global emotes in parallel, then channel emotes
    const [userId, bttvGlobal, ffzGlobal, sevenTvGlobal] = await Promise.all([
      getTwitchUserId(channel),
      fetchBttvGlobal(),
      fetchFfzGlobal(),
      fetchSevenTvGlobal(),
    ]);

    const channelResults = await Promise.all([
      fetchFfzChannel(channel),
      ...(userId
        ? [fetchBttvChannel(userId), fetchSevenTvChannel(userId)]
        : []),
    ]);

    const channelEmotes: ApiEmote[] = channelResults.flat();
    const globalEmotes: ApiEmote[] = [...bttvGlobal, ...ffzGlobal, ...sevenTvGlobal];

    const allEmotes = [...channelEmotes, ...globalEmotes];
    const emote = allEmotes.find((e) => e.code === emoteName);

    if (!emote) {
      return; // Emote not found, fall through to SPA
    }

    const ogImageUrl = toOgImageUrl(emote);
    const animatedSourceUrl = await toOgAnimatedUrl(emote);
    const ogVideoUrl = animatedSourceUrl
      ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/f_mp4,fl_animated,fl_lossy/${animatedSourceUrl}`
      : "";
    const siteUrl = `${url.origin}/${encodeURIComponent(channel)}/${encodeURIComponent(emoteName)}`;

    const html = buildOgHtml(channel, emoteName, ogImageUrl, ogVideoUrl, siteUrl);

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return; // On error, fall through to SPA
  }
};

export const config = {
  path: "/*",
  excludedPath: "/assets/*",
};
