import {Injectable} from '@angular/core';
import {Oauth2pkce, oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {DropboxService, oauthStatus} from '@/_services/sync/dropbox.service';
import {GLOBALS} from '@/_services/globals.service';
import {DialogParams, DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(public dbs: DropboxService,
              public ms: MessageService) {
    dbs.startOauth2Workflow = this.startOauth2Workflow.bind(this);
    dbs.isSameContent = this.isSameContent.bind(this);
    dbs.init();
    if (dbs.status === oauthStatus.hasAccessToken) {
      this._syncType = oauth2SyncType.dropbox;
    }
  }

  _syncType: oauth2SyncType = oauth2SyncType.none;

  get syncType(): oauth2SyncType {
    return this._syncType;
  }

  set syncType(value: oauth2SyncType) {
    console.log('syncType', value);
    this._syncType = value ?? oauth2SyncType.none;
    // GLOBALS.saveWebData();
    if (this._syncType === oauth2SyncType.none) {
      this.dbs.setCredentialsToStorage(null);
      // GLOBALS.saveWebData();
    } else {
      this.dbs.connect();
      // this.gds.oauth2Check();
    }
  }

  get hasSync(): boolean {
    return this.syncType !== oauth2SyncType.none;
  }

  /**
   * get information for the start of the oauth2 workflow.
   */
  startOauth2Workflow(): Observable<Oauth2pkce> {
    const msg = this.msgOauth2Workflow($localize`Dropbox`);
    return this.ms.confirm(msg,
      new DialogParams({image: 'assets/images/dropbox.png'})).pipe(map(result => {
      const ret = new Oauth2pkce();
      ret.doSignin = result.btn === DialogResultButton.yes;
      ret.isDebug = GLOBALS.mayDebug;
      if (ret.doSignin) {
        this._syncType = oauth2SyncType.dropbox;
        // GLOBALS.saveWebData();
      }
      return ret;
    }));
  }

  isSameContent(src: any, dst: any): boolean {
    return JSON.stringify(src) === JSON.stringify(dst);
  }

  msgOauth2Workflow(serviceName: string): string {
    return $localize`The connection to ${serviceName} requires a confirmation
                      that ${GLOBALS.appTitle} can read and write the data from
                       ${serviceName}. This confirmation is requested with special
                        dialogs from ${serviceName}. Everything that has to be
                        confirmed there is beyond ${GLOBALS.appTitle}'s control.
                         Should the confirmation process be started?`;
  }

  // async uploadFile(filename: string, content: string) {
  //   switch (GLOBALS.syncType) {
  //     case oauth2SyncType.dropbox:
  //       return this.dbs.uploadFile(filename, content);
  //   }
  // }

  toggleSyncDropbox() {
    if (this.syncType === oauth2SyncType.dropbox) {
      const params = new DialogParams();
      params.image = 'assets/images/dropbox.png';
      this.ms.confirm($localize`Do you want to unsync with Dropbox?`, params).subscribe(result => {
        if (result.btn == DialogResultButton.yes) {
          this.dbs.disconnect();
          this.syncType = oauth2SyncType.none;
        }
      });
    } else {
      this.dbs.connect();
    }
  }
}
