class TChat {
  proxy(url: string) {
    const refinedUrl = new URL(url);
    const nextUrl = `//images.weserv.nl/?url=${refinedUrl.host}${refinedUrl.pathname}&n=-1`;
    fetch(nextUrl);
    return nextUrl;
  }

  convertToGif(url: string) {
    const refinedUrl = new URL(url);
    const nextUrl = `//images.weserv.nl/?url=${refinedUrl.host}${refinedUrl.pathname}&output=gif&n=-1`;
    fetch(nextUrl);
    return nextUrl;
  }
}

export const TChatAPI = new TChat();
