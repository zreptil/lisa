import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';
import {LinkData, LinkDataRef} from '@/_model/link-data';
import {oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {SyncService} from '@/_services/sync/sync.service';
import {LanguageService} from '@/_services/language.service';
import {LangData} from '@/_model/lang-data';
import {EnvironmentService} from '@/_services/environment.service';
import {MessageService} from '@/_services/message.service';
import {DialogType} from '@/_model/dialog-data';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

export let GLOBALS: GlobalsService;

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  version = '1.0';
  crowdinTitle = 'link-sammlung';
  skipStorageClear = false;
  debugFlag = 'debug';
  debugActive = 'yes';
  appMode = 'edit';
  editPart: string;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  currentFolder: LinkData;
  language: LangData;
  _syncType: oauth2SyncType;
  oauth2AccessToken: string = null;
  viewMode = 'grid';
  theme: string;
  viewModes = [
    {id: 'grid', icon: 'apps'},
    {id: 'world', icon: 'public'},
    {id: 'flex', icon: 'wrap_text'},
    {id: 'thumb', icon: 'fingerprint'},
    {id: 'prime', icon: 'pin'}
  ];
  viewConfig = {
    gridColumns: 4,
    showPrimeNumbers: false
  }
  private flags = '';
  private sortOrder: string = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public env: EnvironmentService,
              public ms: MessageService) {
    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      if (Utils.isEmpty(this.storageVersion)) {
        this.ms.showPopup(WelcomeComponent, 'welcome', null);
      } else if (this.storageVersion !== this.version) {
        this.ms.showPopup(WhatsNewComponent, 'news', null);
      }
    });
  }

  get iconForToggleEdit(): string {
    switch (GLOBALS.appMode) {
      case 'standard':
        return 'tune';
      case 'edit':
        return 'done';
    }
    return '';
  }

  private _links: LinkData[];

  public get links(): LinkData[] {
    const ret = this._links?.filter(e => e) ?? [];
    switch (this.sortOrder) {
      case 'lastUsed':
        ret.sort((a, b) => {
          return -Utils.compare(a.lastUsed ?? 0, b.lastUsed ?? 0);
        });
        break;
    }
    return ret;
  }

  _isDebug = false;

  get isDebug(): boolean {
    return this._isDebug && Log.mayDebug;
  }

  set isDebug(value: boolean) {
    if (!Log.mayDebug) {
      value = false;
    }
    this._isDebug = value;
  }

  get mayDebug(): boolean {
    return Log.mayDebug;
  }

  get mayEdit(): boolean {
    return this.may('edit');
  }

  get isAdmin(): boolean {
    return this.may('admin');
  }

  get runsLocal(): boolean {
    return window.location.href.indexOf('/localhost:') >= 0;
  }

  _isLocal = window.location.href.indexOf('/localhost:') >= 0;

  get isLocal(): boolean {
    return this._isLocal;
  }

  set isLocal(value: boolean) {
    this._isLocal = value;
  }

  get appTitle(): string {
    return document.querySelector('head>title').innerHTML;
  }

  public pullGroupsUp(links?: LinkData[]): void {
    const hasParent = links != null;
    if (!hasParent) {
      links = this._links;
    }
    for (let i = 0; i < links?.length ?? 0; i++) {
      if (links[i].children != null) {
        if (hasParent) {
          this._links.splice(0, 0, links[i]);
          links.splice(i, 1);
          i--;
        } else {
          this.pullGroupsUp(links[i].children);
        }
      }
    }
  }

  public setIndexToLinks(links?: LinkData[]): void {
    const hasParent = links != null;
    if (!hasParent) {
      this.pullGroupsUp();
      links = this._links;
    }
    for (let i = 0; i < links?.length ?? 0; i++) {
      links[i].index = i;
      if (links[i].children != null) {
        this.setIndexToLinks(links[i].children);
      }
    }
  }

  async loadSharedData() {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('sharedData')) ?? {};
    } catch {
    }
    let syncData: any = await this.sync.downloadFile(this.env.settingsFilename);
    if (syncData != null) {
      try {
        if (+syncData.s0 != +(storage.s0 ?? 0)) {
          if (storage?.s0 == null) {
            this._loadSharedData(syncData);
            this.saveSharedData();
            return;
          }
          if (this.isLocal) {
            const msg = [
              $localize`The local data has another date than the date saved in Dropbox.`,
              $localize`Local` + `: ${Utils.fmtDate(new Date(storage.s0), Utils.fullDate)}`,
              $localize`Dropbox` + `: ${Utils.fmtDate(new Date(syncData.s0), Utils.fullDate)}`,
              $localize`Use local data or data from Dropbox?`
            ];
            this.ms.ask(msg, {
              type: DialogType.confirm,
              title: $localize`Question`,
              buttons: [
                {title: $localize`Local`, result: {btn: 'local'}},
                {title: $localize`Dropbox`, result: {btn: 'dropbox'}}]
            }).subscribe(result => {
              switch (result?.btn) {
                case 'dropbox':
                  this._loadSharedData(syncData);
                  this.saveSharedData();
                  break;
                default:
                  this._loadSharedData(storage);
                  break;
              }
            });
            return;
          } else if (+syncData.s0 > +(storage.s0 ?? 0)) {
            this._loadSharedData(syncData);
            return;
          }
        }
      } catch {
      }
    }
    this._loadSharedData(storage);
  }

  saveSharedData(): void {
    const storage: any = {
      s0: Date.now(),
      s1: this.version,
      s2: this._links.map(l => {
        const ret = l.asJson;
        // the uniqueId must not be saved, it is only unique
        // during runtime of the app
        delete ret.ui;
        return ret
      }),
      s3: this.viewMode,
      s4: this.appMode,
      s5: this.viewConfig
    };
    const data = JSON.stringify(storage);
    localStorage.setItem('sharedData', data);
    if (this.sync.hasSync) {
      this.sync.uploadFile(this.env.settingsFilename, data);
    }
  }

  loadWebData(): void {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('webData')) ?? {};
    } catch {
    }

    const code = storage.w0 ?? 'en-GB';
    this.language = this.ls.languageList.find((lang) => lang.code === code);
    this._syncType = storage.w1 ?? oauth2SyncType.none;
    this.oauth2AccessToken = storage.w2;
    this.theme = storage.w3 ?? 'standard';

    // validate values
    if (this.oauth2AccessToken == null) {
      this._syncType = oauth2SyncType.none;
    }
  }

  saveWebData(): void {
    const storage: any = {
      w0: this.language.code ?? 'de_DE',
      w1: this._syncType,
      w2: this.oauth2AccessToken,
      w3: this.theme
    };
    localStorage.setItem('webData', JSON.stringify(storage));
  }

  async requestJson(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    return this.request(url, params).then(response => {
      return response?.body;
    });
  }

  async request(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    params ??= {};
    params.method ??= 'get';
    params.showError ??= true;
    params.asJson ??= false;
    params.timeout ??= 1000;
    let response;
    const req = new HttpRequest(params.method, url,
      null,
      params.options);
    try {
      switch (params.method.toLowerCase()) {
        case 'post':
          response = await lastValueFrom(this.http.post(url, params.body, params.options).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
        default:
          response = await lastValueFrom(this.http.request(req).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
      }
    } catch (ex: any) {
      if (ex instanceof CustomTimeoutError) {
        response = $localize`There was no answer within ${params.timeout / 1000} seconds at ${url}`;
      } else if (ex?.messge != null) {
        response = ex.message;
      } else {
        response = ex;
      }
    }
    return params.asJson ? response.body : response;
  }

  insertLink(link: LinkData) {
    if (this.currentFolder?.children != null && link.children == null) {
      this.currentFolder?.children.push(link);
    } else {
      this._links.splice(0, 0, link);
    }
    this.setIndexToLinks();
  }

  deleteLink(link: LinkData) {
    const found = this.findLink(link.uniqueId, null, this._links);
    console.log(link, this._links, found);
    if (found?.list != null) {
      found.list.splice(link.index, 1);
    }
    this.setIndexToLinks();
  }

  findLink(uniqueId: number, parent?: LinkData, list = this._links): LinkDataRef {
    for (const check of list ?? []) {
      if (check.uniqueId === uniqueId) {
        return {link: check, parent: parent, list: list};
      }
      if (check.children != null) {
        const subLink = this.findLink(uniqueId, check, check.children);
        if (subLink != null) {
          return subLink;
        }
      }
    }
    return null;
  }

  moveLink(previousIndex: number, currentIndex: number) {
    moveItemInArray(this._links, previousIndex, currentIndex);
    this.setIndexToLinks();
    this.saveSharedData();
  }

  noImage(evt: ErrorEvent) {
    (evt.target as any).src = 'assets/images/empty.png';
  }

  public clickEdit(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.appMode = 'edit'
    GLOBALS.saveSharedData();
  }

  public toggleEdit(evt: MouseEvent) {
    evt.stopPropagation();
    switch (GLOBALS.appMode) {
      case 'standard':
        GLOBALS.appMode = 'edit';
        break;
      case 'edit':
        GLOBALS.appMode = 'standard';
        break;
    }
    GLOBALS.saveSharedData();
  }

  private _loadSharedData(storage: any): void {
    this.storageVersion = storage.s1;
    this._links = storage.s2?.map((l: any) => {
      return LinkData.fromJson(l);
    }) ?? [];
    this.viewMode = storage.s3 ?? this.viewModes[0].id;
    this.appMode = storage.s4 ?? 'edit';
    if (storage.s5 != null) {
      this.viewConfig = storage.s5;
    }

    // validate values
    if (this._links == null) {
      this._links = [];
    }
    this.setIndexToLinks();
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}

// {"s0":1690779458920,"s1":"1.0","s2":[{"l":"Arbeit","u":null,"iu":"assets/images/favicon-unknown.png","x":1938,"y":892.5,"c":[{"l":"CPU Gehaltsportal","u":"https://503262.landwehr-hosting.de/","lu":1680338883278,"iu":"https://503262.landwehr-hosting.de/gfx/favicon.ico","x":884.61,"y":144.95,"ui":69},{"l":"CPU Zeiterfassung","u":"https://zeiterfassung.cpu-ag.com/","lu":1689052627434,"iu":"https://www.aida-orga.de/multi-wGlobal/wGlobal/layout/images/favicon.ico","x":845,"y":52,"ui":70},{"l":"Jenkins","u":"http://172.16.2.223:8080/","lu":1688645493716,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.jenkins.io/","ui":71,"o":false}],"o":false},{"l":"Netzwerk","u":null,"lu":1679945209696,"iu":"assets/images/favicon-unknown.png","x":982.1428571428571,"y":395.30000000000007,"c":[{"l":"Fritz!Box 7360 (m-Net)","u":"http://192.168.178.1","lu":1689483314655,"i":"","iu":"https://upload.wikimedia.org/wikipedia/de/6/68/Fritz!_Logo.svg","x":356.5,"y":338,"ui":73},{"l":"Fritz!Box 7590 (Andi)","u":"http://192.168.178.13","lu":1689578671771,"i":"Das hier ist eine fröhliche Info, die ein bisschen länger sein sollte, damit man sieht, wie das ausschaut.","iu":"https://upload.wikimedia.org/wikipedia/de/6/68/Fritz!_Logo.svg","x":287,"y":631.5,"ui":74},{"l":"ReptileMovies Config","u":"https://192.168.178.100:5001","lu":1686164975212,"iu":"assets/images/favicon-unknown.png","ui":75,"o":false},{"l":"ReptileSeasons Config","u":"http://192.168.178.101:5000","lu":1688650743448,"iu":"assets/images/favicon-unknown.png","ui":76,"o":false}],"o":false},{"l":"Programmierung","u":null,"lu":1679979681953,"iu":"assets/images/favicon-unknown.png","x":483,"y":13,"c":[{"l":"Nightscout Reporter (Dev)","u":"https://nightrep-dev.zreptil.de","lu":1682569310153,"iu":"https://nightrep-dev.zreptil.de/assets/themes/standard/favicon.png","x":916,"y":297,"ui":78},{"l":"Dropbox Apps","u":"https://www.dropbox.com/developers/apps/","lu":1680497467962,"iu":"https://cfl.dropboxstatic.com/static/metaserver/static/images/favicon-vfl8lUR9B.ico","x":57.43015873015884,"y":412.4126984126983,"ui":79},{"l":"StayLow","u":"https://staylow.zreptil.de","lu":1679927306650,"iu":"https://staylow.zreptil.de/favicon.ico","x":728.3846282958984,"y":446.5384521484375,"ui":80},{"l":"Material Symbols and Icons - Google Fonts","u":"https://fonts.google.com/icons?icon.style=Filled&icon.set=Material+Icons","lu":1680418604898,"iu":"https://www.gstatic.com/images/icons/material/apps/fonts/1x/catalog/v5/favicon.svg","ui":81,"o":false},{"l":"Reptimer","u":"https://reptimer.zreptil.de","lu":1680238873766,"iu":"https://reptimer.zreptil.de/assets/png/logo.png","ui":82,"o":false},{"l":" Json Grid Viewer Online - All-in-One Solution","u":"https://jsongrid.com/json-grid","lu":1680500757000,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://jsongrid.com/json-grid","ui":83,"o":false},{"l":"Nightscout Reporter (Diabetologe)","u":"https://nightrep-dev.zreptil.de/shortcut?name=Diabetologe","lu":1689571087267,"iu":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/400px-PDF_file_icon.svg.png","ui":84,"o":false},{"l":"Nightscout Reporter (Historisch)","u":"https://nightrep-dev.zreptil.de/shortcut?name=Diabetologe&shift=3","lu":1689571171575,"iu":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/400px-PDF_file_icon.svg.png","ui":85,"o":false},{"l":"Creatoor","u":"https://creatoor.zreptil.de","lu":1682060200837,"iu":"https://creatoor.zreptil.de/assets/images/icon64x64.png","ui":86,"o":false}],"o":false},{"l":"Feste Tabs","u":null,"iu":"assets/images/favicon-unknown.png","x":64,"y":64,"c":[{"l":"Lisa","u":"https://lisa.zreptil.de/","iu":"https://lisa.zreptil.de/assets/themes/standard/favicon.png","ui":88,"o":false},{"l":"Gmail","u":"https://mail.google.com/mail/u/0/#inbox","iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://mail.google.com/mail/u/0/#inbox","ui":89,"o":false},{"l":"Chat","u":"https://mail.google.com/chat","iu":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Google_Chat_icon_%282020%29.svg/768px-Google_Chat_icon_%282020%29.svg.png","ui":90,"o":false},{"l":"WhatsApp","u":"https://web.whatsapp.com/","iu":"https://corg.zreptil.de?url=https://web.whatsapp.com/img/favicon/1x/favicon.png","ui":91,"o":false},{"l":"Nightscout","u":"https://diamant.ns.10be.de/","lu":1689139011707,"iu":"https://diamant.ns.10be.de/images/apple-touch-icon-57x57.png","ui":92,"o":false},{"l":"Looper Community","u":"https://de.loopercommunity.org/","iu":"https://de.loopercommunity.org/uploads/default/optimized/1X/df1f56b99254dc6d9cd1b2a8bc839932db40231d_2_32x32.png","ui":93,"o":false},{"l":"Messages by Google","u":"https://messages.google.com/","iu":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Google_Messages_icon_%282022%29.svg/288px-Google_Messages_icon_%282022%29.svg.png","ui":94,"o":false},{"l":"Google Drive","u":"https://drive.google.com/","iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://drive.google.com/","ui":95,"o":false},{"l":"Facebook","u":"https://www.facebook.com/","iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.facebook.com/","ui":96,"o":false},{"l":"Google Keep","u":"https://keep.google.com/","iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://keep.google.com/","ui":97,"o":false}],"o":false},{"l":"Homepages","u":null,"iu":"assets/images/favicon-unknown.png","x":178,"y":306,"c":[{"l":"Webtropia ZKM","u":"https://zkm.webtropia.com/s/home/overview","lu":1688645512782,"iu":"https://corg.zreptil.de/?url=https://s2.googleusercontent.com/s2/favicons?domain=https://webtropia.com","ui":99},{"l":"Webtropia Plesk","u":"https://zreptil.de:8443","lu":1687501114439,"i":"zreptil.de","iu":"https://scdn1.plesk.com/wp-content/uploads/2020/11/31183738/cropped-Logo_Plesk-32x32.png","ui":100},{"l":"Reptimer","u":"https://reptimer.zreptil.de","lu":1681706677694,"iu":"https://reptimer.zreptil.de/assets/png/logo.png","ui":101,"o":false},{"l":"Webtropia Plesk","u":"https://zreptilx.de:8443","lu":1686207054547,"i":"zreptilx.de","iu":"https://scdn1.plesk.com/wp-content/uploads/2020/11/31183738/cropped-Logo_Plesk-32x32.png","ui":102},{"l":"Jenkins","u":"http://zreptilx.de:8080/","lu":1690631850338,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.jenkins.io/","ui":103,"o":false}],"o":false},{"l":"Social Media","u":null,"iu":"assets/images/favicon-unknown.png","x":1160.5428571428572,"y":50.428571428571445,"c":[{"l":"Looper Community","u":"https://de.loopercommunity.org/","iu":"https://de.loopercommunity.org/uploads/default/optimized/1X/df1f56b99254dc6d9cd1b2a8bc839932db40231d_2_32x32.png","ui":105,"o":false},{"l":"Discord","u":"https://discord.com/channels/486821686105210882/486845704002600960","lu":1690555454803,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://discord.com/channels/486821686105210882/486845704002600960","x":64,"y":64,"ui":106},{"l":"ChatGPT","u":"https://chat.openai.com/","lu":1682053406925,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://chat.openai.com/","ui":107,"o":false}],"o":false},{"l":"Filme","u":null,"iu":"assets/images/favicon-unknown.png","x":1508.1142857142859,"y":73.81428571428572,"c":[{"l":"Wer streamt es?","u":"https://werstreamt.es","lu":1682059086368,"i":"Prüfe die Verfügbarkeit von Filmen bei Netflix, Amazon, Disney+ u.v.m.","iu":"https://www.werstreamt.es//_resources/themes/wse/images/touch-icon-iphone.png?m=1680006428","ui":109},{"l":"Movies","u":"https://play.google.com/store/movies","lu":1682059090988,"iu":"https://www.gstatic.com/android/market_images/web/favicon_v3.ico","ui":110},{"l":"Google Familienmediathek","u":"https://play.google.com/movies","lu":1681271014121,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://play.google.com/movies","ui":111},{"l":"Netflix","u":"https://www.netflix.com/browse","lu":1685170510195,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.netflix.com/browse","ui":112,"o":false},{"l":"Prime Video","u":"https://www.amazon.de/gp/video/storefront?redirectFromSmile=1","lu":1683696470074,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.amazon.de/gp/video/storefront?redirectFromSmile=1","ui":113,"o":false},{"l":"Disney+","u":"https://www.disneyplus.com/home","lu":1681238750319,"iu":"https://static-assets.bamgrid.com/product/disneyplus/favicons/favicon.85e279041d79e51b147c1b6feb4f981e.ico","ui":114,"o":false},{"l":"Joyn","u":"https://www.joyn.de/","lu":1682837207741,"i":"Serien, Filme, Sport &amp; Live TV jederzeit streamen","iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://www.joyn.de/","ui":115,"o":false}],"o":false},{"l":"Spiele","u":null,"lu":1679947346801,"iu":"assets/images/favicon-unknown.png","x":841,"y":83,"c":[{"l":"ᐅ Wörter suchen nach Buchstaben / Endung / Anfang / Inhalt etc.","u":"https://www.buchstaben.com/woerter-suchen","iu":"https://www.buchstaben.com/image/favicon-16.png","ui":117},{"l":"Hayday","u":"https://docs.google.com/spreadsheets/d/1mEVvqe00kfsNhBlP2qopFEVYiyTZL-pCqzRzhRgxXRo/edit#gid=1967820234","lu":1690779458920,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://docs.google.com/spreadsheets/d/1mEVvqe00kfsNhBlP2qopFEVYiyTZL-pCqzRzhRgxXRo/edit#gid=1967820234","x":569,"y":-1,"ui":118},{"l":"Gilde Old Bones","u":"https://docs.google.com/spreadsheets/d/1eZHayYn-q0LDafKYt8A4q05R9zgYix2Stq6WRACJ6U0/edit#gid=615273243","lu":1690129427079,"iu":"https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico","x":576.1142857142858,"y":65.41428571428568,"ui":119},{"l":"Diablo 4 Totenbeschwörer","u":"https://www.wowhead.com/diablo-4/de/skill-tree-calc/necromancer/CAgaKGAAAAtmm9iQAAmdmuAAmvAnaAAntnwAAgLAAn1QjmkCAAntgCnEAAnxAAKAWAhlAAAAtWtNgNAAAAuAnDG76U15jRv5xox6IUD5o0n5wNOD7bLMWM","lu":1690437868071,"iu":"https://wow.zamimg.com/images/logos/favicon-d4.png","ui":120,"o":false},{"l":"Diablo 4 Druide Sturm","u":"https://www.wowhead.com/diablo-4/de/skill-tree-calc/druid/CAgalOhCAAAAiCiRh8AAAAYidgMAAZAAAAicjLh0AAAAg-hDijAAhsAATAAYaJJbIKAAggAAAAgSgXgzAG5B-h42-O440q5EjJ5DQo5OzLF6KuIFBA5rrJ","lu":1690173979530,"iu":"https://wow.zamimg.com/images/logos/favicon-d4.png","ui":121,"o":false},{"l":"Diablo 4 Druide Werbär","u":"https://www.wowhead.com/diablo-4/de/skill-tree-calc/druid/CAgalVjASdIAAAAgCgHhTg5AAhSAAhdAAiqgYixguXAAgBAAiai1gCAAgjAAh0iLhOAAiOjPgYAAUAAOAAUJJXG447t5JJN46Lq5J1O58Z742yjF6KuGBAH5rrJ","lu":1688735794763,"iu":"https://wow.zamimg.com/images/logos/favicon-d4.png","ui":122,"o":false},{"l":"Diablo 4 Werbär Guide","u":"https://www.only4gamers.de/diablo-4-werbaer-build-endgame/","lu":1688736304319,"iu":"https://www.only4gamers.de/favicon.ico","ui":123,"o":false},{"l":"Altar von Lilith in Diablo 4: Fundorte & Belohnungen","u":"https://diablo.4fansites.de/diablo-4-sanktuario-altar-von-lilith.php","lu":1689396457825,"iu":"https://diablo.4fansites.de/apple-touch-icon.png","ui":124,"o":false}],"o":false},{"l":"Zeugs","u":null,"iu":"assets/images/favicon-unknown.png","x":582,"y":310,"c":[{"l":"Ergo","u":"https://am.ergo.com/am/cdcservlet?loginURI=/extlogin/login.html&goto=https%3A%2F%2Fkunde-s.ergo.de%2Fmeineversicherungen%2Flz%2Fstart.aspx%3Fvu%3Dergo&RequestID=14639&MajorVersion=1&MinorVersion=0&ProviderID=https%3A%2F%2Fkunde-s.ergo.de%3A443%2Famagent%3FRealm%3D%2Fcustomerportal","lu":1680153601448,"iu":"https://s2.googleusercontent.com/s2/favicons?domain=https://ergo.com","x":572.4714285714286,"y":358.15714285714284,"ui":126},{"l":"Cults","u":"https://cults3d.com/en/creations/mine","lu":1687844435892,"iu":"https://assets.cults3d.com/assets/favicons/cults-e19f0b01f785a57ca7e0a5aeb5b365ea8255e2d52389045f7049e470499130b4.ico","ui":127,"o":false},{"l":"Status Freestyle Libre","u":"https://status.freestyle.abbott/","iu":"assets/images/favicon-unknown.png","ui":128,"o":false},{"l":"Home - Eurovision Song Contest","u":"http://songcontest.ch","lu":1685096158165,"iu":"data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=","ui":129,"o":false},{"l":"Cube &middot; Intro to CSS 3D transforms","u":"https://3dtransforms.desandro.com/cube","lu":1687844423326,"iu":"assets/images/favicon-unknown.png","ui":130,"o":false}],"o":false},{"l":"Temporäre Links","u":null,"iu":"assets/images/favicon-unknown.png","x":362,"y":188,"c":[],"o":true},{"l":"Rätsel am Sonntag","u":null,"iu":"assets/images/favicon-unknown.png","x":64,"y":64,"c":[{"l":"Puzzler","u":"https://puzzler.zreptil.de","lu":1687873063888,"iu":"assets/images/favicon-unknown.png","ui":133,"o":false},{"l":"Puzzik","u":"https://puzzik.zreptil.de","lu":1680415680595,"iu":"https://puzzik.zreptil.de/favicon.ico","ui":134,"o":false}],"o":true}],"s3":"grid","s4":"standard","s5":{"gridColumns":4}}
