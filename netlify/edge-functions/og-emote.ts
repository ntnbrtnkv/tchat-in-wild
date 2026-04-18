const BOT_UA_REGEX =
  /TelegramBot|Twitterbot|Discordbot|Slackbot|WhatsApp|facebookexternalhit|LinkedInBot|vkShare|Viber|Googlebot/i;

const EMOTES_API = "https://emotes.adamcy.pl/v1";
const CLOUDINARY_CLOUD = "drywhmegg";

type ApiEmote = {
  provider: number;
  code: string;
  urls: Array<{ size: string; url: string }>;
};

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
    // Fetch channel + global emotes in parallel
    const [channelRes, globalRes] = await Promise.all([
      fetch(`${EMOTES_API}/channel/${encodeURIComponent(channel)}/emotes/all`),
      fetch(`${EMOTES_API}/global/emotes/all`),
    ]);

    const channelEmotes: ApiEmote[] = channelRes.ok
      ? await channelRes.json()
      : [];
    const globalEmotes: ApiEmote[] = globalRes.ok
      ? await globalRes.json()
      : [];

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
