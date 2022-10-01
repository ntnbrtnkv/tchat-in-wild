class TChat {
  async proxy(url: string) {
    const refinedUrl = new URL(url);
    const nextUrl = `//images.weserv.nl/?url=${refinedUrl.host}${refinedUrl.pathname}`;
    await fetch(nextUrl);
    return nextUrl;
  }

  async convertToGif(url: string) {
    const refinedUrl = new URL(url);
    const nextUrl = `//images.weserv.nl/?url=${refinedUrl.host}${refinedUrl.pathname}&output=gif&n=-1`;
    await fetch(nextUrl);
    return nextUrl;
  }
}

export const TChatAPI = new TChat();
