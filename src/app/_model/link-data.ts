export class LinkData {

  lastUsed: number;
  index: number;

  constructor(public label: string,
              public url: string
  ) {
  }

  get asJson(): any {
    return {
      l: this.label,
      u: this.url,
      lu: this.lastUsed
    }
  }

  static fromJson(src: any): LinkData {
    const ret = new LinkData(src.l, src.u);
    ret.lastUsed = src.lu;
    return ret;
  }
}
