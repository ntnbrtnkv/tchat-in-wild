import type { AxiosInstance } from "axios";
import axios from "axios";

type IResponse = {
  gif: string;
};

class TChat {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: "https://tchat-backend-toha1100.koyeb.app",
    });
  }

  convertToGif(url: string) {
    const data = new FormData();
    data.set("url", url);

    return this.axios
      .post<IResponse>(`/convert`, data)
      .then(({ data }) => data.gif);
  }
}

export const TChatAPI = new TChat();
