import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';
import {LinkData} from '@/_model/link-data';
import {ComponentType} from '@angular/cdk/overlay';
import {oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {SyncService} from '@/_services/sync/sync.service';
import {LanguageService} from '@/_services/language.service';
import {LangData} from '@/_model/lang-data';
import {EnvironmentService} from '@/_services/environment.service';

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
  skipStorageClear = false;
  debugFlag = 'debug';
  debugActive = 'yes';
  appMode = 'standard';
  editPart: string;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  language: LangData;
  _syncType: oauth2SyncType;
  oauth2AccessToken: string = null;
  viewMode = 'flex';
  theme: string;
  viewModes = [
    {id: 'world', icon: 'public'},
    {id: 'flex', icon: 'wrap_text'},
    {id: 'grid', icon: 'apps'}
  ];
  private flags = '';
  private sortOrder: string = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public env: EnvironmentService) {
    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      if (Utils.isEmpty(this.storageVersion)) {
        this.currentPage = 'welcome';
      } else if (this.storageVersion !== this.version) {
        this.currentPage = 'news';
      } else {
        this.currentPage = 'main';
      }
    });
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

  public setIndexToLinks(links = this._links): void {
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
        if (+syncData.s0 > +(storage.s0 ?? 0)) {
          storage = syncData;
        }
      } catch {
      }
    }

    this.storageVersion = storage.s1;
    this._links = storage.s2?.map((l: any) => {
      return LinkData.fromJson(l);
    }) ?? [];
    this.viewMode = storage.s3 ?? this.viewModes[0].id;
    this.appMode = storage.s4 ?? 'standard';

    // validate values
    if (this._links == null) {
      this._links = [];
      //   new LinkData('Google Drive', 'https://drive.google.com'),
      //   new LinkData('Dropbox', 'https://dropbox.com'),
      //   new LinkData('Nighscout Reporter', 'https://nightrep-dev.zreptil.de')
      // ];
      // const links: LinkData[] = [];
      // for (let i = 0; i < 10; i++) {
      //   for (const link of this._links) {
      //     links.push(new LinkData(link.label, link.url));
      //   }
      // }
      // this._links = links;
    }
    this.setIndexToLinks(this._links);
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
      s4: this.appMode
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
//    this.oauth2AccessToken = localStorage.getItem('dropboxsync');
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

  dragName(type: ComponentType<any>): string {
    return Utils.camelToKebab(type.name).toLowerCase().replace(/-component$/, '');
  }

  insertLink(link: LinkData) {
    this._links.splice(0, 0, link);
    this.setIndexToLinks(this._links);
  }

  deleteLink(link: LinkData) {
    const found = this.findLink(link.uniqueId, null, this._links);
    console.log(link, this._links, found);
    if (found?.list != null) {
      found.list.splice(link.index, 1);
    }
    this.setIndexToLinks(this._links);
  }

  findLink(uniqueId: number, parent?: LinkData, list = this._links): { link: LinkData, parent: LinkData, list: LinkData[] } {
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
    this.setIndexToLinks(this._links);
  }

  noImage(evt: ErrorEvent) {
    (evt.target as any).src = 'assets/images/empty.png';
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}
