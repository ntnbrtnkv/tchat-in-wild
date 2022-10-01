class TChat {
  proxy(url: string) {
    const refinedUrl = new URL(url);
    return `//images.weserv.nl/?url=${refinedUrl.host}${refinedUrl.pathname}`;
  }

  convertToGif(url: string) {
    return `${this.proxy(url)}&output=gif&n=-1`;
  }
}

export const TChatAPI = new TChat();
