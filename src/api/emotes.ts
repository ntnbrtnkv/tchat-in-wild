import type { AxiosInstance } from "axios";
import axios from "axios";
import type { IEmote } from "@/types/Emote";

type IResponse = IEmote[];

class Emotes {
  private axios: AxiosInstance;

  constructor(private services = "all") {
    this.axios = axios.create({
      baseURL: "https://emotes.adamcy.pl/v1",
    });
  }

  getChannelEmotes(channel: string) {
    return this.axios
      .get<IResponse>(`/channel/${channel}/emotes/${this.services}`)
      .then(({ data }) => data);
  }

  getGlobalEmotes() {
    return this.axios
      .get<IResponse>(`/global/emotes/${this.services}`)
      .then(({ data }) => data);
  }
}

export const EmotesAPI = new Emotes();
