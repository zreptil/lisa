export class LinkData {

  lastUsed: number;
  index: number;
  info: string;

  constructor(public label: string,
              public url: string
  ) {
  }

  get favicon(): string {
    return `https://s2.googleusercontent.com/s2/favicons?domain=${this.url}`;
  }

  get asJson(): any {
    return {
      l: this.label,
      u: this.url,
      lu: this.lastUsed,
      i: this.info
    }
  }

  static fromJson(src: any): LinkData {
    const ret = new LinkData(src.l, src.u);
    ret.lastUsed = src.lu;
    ret.info = src.info;
    return ret;
  }
}
