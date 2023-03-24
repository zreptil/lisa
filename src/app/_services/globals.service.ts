import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';

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
  editPart: string;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  oauth2AccessToken: string = null;
  private flags = '';

  constructor(public http: HttpClient) {
    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData();
    let pos = Utils.partlist.length * 3 + 3;
    if (Utils.isEmpty(this.storageVersion)) {
      this.currentPage = 'welcome';
    } else if (this.storageVersion !== this.version) {
      this.currentPage = 'news';
    } else {
      this.currentPage = 'main';
    }
    this.saveWebData();
    this.saveSharedData();
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

  loadSharedData(): void {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('sharedData')) ?? {};
    } catch {
    }

    this.storageVersion = storage.s1;
    // validate values
  }

  saveSharedData(): void {
    const storage: any = {
      s1: this.version,
    };
    localStorage.setItem('sharedData', JSON.stringify(storage));
    // if (this.sync.hasSync) {
    //   this.sync.uploadFile('creatoor-db.json', JSON.stringify(this.creatoorData));
    // }
  }

  loadWebData(): void {
    // let storage: any = {};
    // try {
    //   storage = JSON.parse(localStorage.getItem('webData')) ?? {};
    // } catch {
    // }
    //
    // this._syncType = storage.w1;
    // this.oauth2AccessToken = storage.w2;
    //
    // // validate values
    // if (this.oauth2AccessToken == null) {
    //   this._syncType = oauth2SyncType.none;
    // }
  }

  saveWebData(): void {
    // const storage: any = {
    //   w1: this._syncType,
    //   w2: this.oauth2AccessToken
    // };
    // localStorage.setItem('webData', JSON.stringify(storage));
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
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
        response = $localize`Es gab keine Antwort innerhalb von ${params.timeout / 1000} Sekunden bei ${url}`;
      } else if (ex?.messge != null) {
        response = ex.message;
      } else {
        response = ex;
      }
    }
    return params.asJson ? response.body : response;
  }
}
