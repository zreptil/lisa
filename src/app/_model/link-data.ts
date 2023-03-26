export class LinkData {

  lastUsed: number;
  index: number;
  info: string;
  iconUrl: string;
  x: number;
  y: number;

  constructor(public label: string,
              public url: string
  ) {
  }

  get favicon(): string {
    // return `https://s2.googleusercontent.com/s2/favicons?domain=${this.url}`;
    if (this.iconUrl?.startsWith('assets/')) {
      return this.iconUrl;
    }
    return `https://corg.zreptil.de/?url=${this.iconUrl}`;
  }

  get asJson(): any {
    return {
      l: this.label,
      u: this.url,
      lu: this.lastUsed,
      i: this.info,
      iu: this.iconUrl,
      x: this.x,
      y: this.y
    }
  }

  static fromJson(src: any): LinkData {
    const ret = new LinkData(src.l, src.u);
    ret.lastUsed = src.lu;
    ret.info = src.i;
    ret.iconUrl = src.iu;
    ret.x = src.x;
    ret.y = src.y;
    return ret;
  }
}
