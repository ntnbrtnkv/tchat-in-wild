import type { IEmote } from "@/types/Emote";

export async function copyEmote(emote: IEmote) {
  const response = await fetch(emote.urls[emote.urls.length - 1].url);
  const blob = await response.blob();

  const item = new ClipboardItem({ "image/png": blob });
  // for FF set to true: dom.events.asyncClipboard.clipboardItem
  navigator.clipboard.write([item]);
}
