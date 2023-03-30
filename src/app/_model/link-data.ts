import {Utils} from '@/classes/utils';

export class LinkDataRef {
  link: LinkData;
  parent: LinkData;
  list: LinkData[];
}

export class LinkData {

  uniqueId: number;
  lastUsed: number;
  index: number;
  info: string;
  iconUrl: string;
  x: number;
  y: number;
  children: LinkData[];
  shortLabel: string;
  isOpen = false;

  constructor(public label: string,
              public url: string
  ) {
    this.uniqueId = Utils.nextUniqueId();
  }

  get dragPosition(): any {
    return {x: this.x, y: this.y};
  }

  set dragPosition(value: any) {
    this.x = value.x;
    this.y = value.y;
  }

  get favicon(): string {
    // return `https://s2.googleusercontent.com/s2/favicons?domain=${this.url}`;
    if (this.iconUrl?.startsWith('assets/')) {
      return this.iconUrl;
    }
    if (this.iconUrl?.startsWith('@')) {
      return this.iconUrl.substring(1);
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
      y: this.y,
      sl: this.shortLabel,
      c: this.children?.map(c => c.asJson),
      ui: this.uniqueId,
      o: this.isOpen
    }
  }

  static fromJson(src: any): LinkData {
    const ret = new LinkData(src.l, src.u);
    ret.fillFromJson(src);
    return ret;
  }

  fillFromJson(src: any): void {
    this.lastUsed = src.lu;
    this.info = src.i;
    this.iconUrl = src.iu;
    this.x = src.x;
    this.y = src.y;
    this.shortLabel = src.sl;
    this.isOpen = src.o;
    if (src.c != null) {
      this.children = [];
      for (const child of src.c) {
        this.children.push(LinkData.fromJson(child));
      }
    }
  }
}
