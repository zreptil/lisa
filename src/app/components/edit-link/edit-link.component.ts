import {Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LinkData} from '@/_model/link-data';
import {Utils} from '@/classes/utils';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';

@Component({
  selector: 'app-edit-link',
  templateUrl: './edit-link.component.html',
  styleUrls: ['./edit-link.component.scss']
})
export class EditLinkComponent {
  orgData: any;

  constructor(public globals: GlobalsService,
              public dlgRef: MatDialogRef<any>,
              public ms: MessageService,
              @Inject(MAT_DIALOG_DATA) public data: LinkData) {
    this.orgData = data.asJson;
    this.orgData.index = data.index;
  }

  clickCancel(evt: MouseEvent) {
    evt.stopPropagation();
    this.data.fillFromJson(this.orgData);
    this.data.index = this.orgData.index;
    this.data.uniqueId = this.orgData.uniqueId;
    this.dlgRef.close({btn: 2});
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.data.index == null) {
      GLOBALS.insertLink(this.data);
    }
    GLOBALS.saveSharedData();
    this.dlgRef.close({btn: 1});
  }

  onLabelFocus(_evt: FocusEvent) {
    this.retrieveWebSiteData(this.data, [this.data.url]);
  }

  clickDelete(evt: MouseEvent) {
    evt.stopPropagation();
    this.ms.askDeleteLink(this.data).subscribe(result => {
      if (result.btn === DialogResultButton.yes) {
        this.dlgRef.close();
      }
    });
  }

  clickClone(evt: MouseEvent) {
    evt.stopPropagation();
    this.orgData = LinkData.fromJson(this.data.asJson);
    this.orgData.index = null;
    this.data = LinkData.fromJson(this.orgData.asJson);
    this.data.label += ' (Copy)';
    GLOBALS.insertLink(this.data);
  }

  clickFetchIcon(evt: MouseEvent) {
    evt.stopPropagation();
    this.retrieveWebSiteData(this.data, [this.data.url, this.data.iconUrl], true);
  }

  private retrieveWebSiteData(data: LinkData, urlList: string[], forceUpdate = false, failed?: () => void) {
    urlList = urlList.filter(l => !Utils.isEmpty(l));
    const srcUrl = urlList[0];
    urlList.splice(0, 1);
    let url = `https://corg.zreptil.de/?url=${srcUrl}`;
    GLOBALS.request(url, {options: {responseType: 'text'}}).then((response: any) => {
      if (Utils.isEmpty(data.label)) {
        const title = response?.body?.match(/<title>(.*)<\/title>/);
        if (title != null) {
          data.label = title?.[1];
        }
      }
      if (Utils.isEmpty(data.iconUrl) || forceUpdate) {
        const icon = response?.body?.match(/<link(.*)rel="(shortcut icon|icon|apple-touch-icon)"([^>]*)>/);
        if (icon?.length === 4) {
          const check = ` ${icon[0]} `;
          let found = check.match(/(.*)href="([^"]*)"(.*)/);
          if (found?.length === 4) {
            let url = found[2];
            if (url.startsWith('//')) {
              url = `https:${url}`;
            }
            if (!url.startsWith('http:') && !url.startsWith('https:')) {
              url = Utils.rootDomain(srcUrl, url);
            }
            if (!url.endsWith('.ico')) {
              data.iconUrl = url;
              forceUpdate = false;
            }
          }
        } else {
          console.log('icon', response?.body, icon);
          if (failed != null) {
            failed();
            return;
          }
        }

        if (Utils.isEmpty(data.iconUrl) || forceUpdate) {
          url = `https://s2.googleusercontent.com/s2/favicons?domain=${srcUrl}`;
          // url = `https://corg.zreptil.de/?url=${srcUrl}`;
          GLOBALS.request(`https://corg.zreptil.de/?url=${url}`, {options: {responseType: 'text'}}).then((response: any) => {
            if (!Utils.isEmpty(response?.body)) {
              data.iconUrl = url;
            } else {
              if (urlList.length > 0) {
                this.retrieveWebSiteData(data, urlList, forceUpdate, failed);
              } else {
                data.iconUrl = 'assets/images/favicon-unknown.png';
              }
            }
            console.log(response);
          });
        }
        console.log('Das Ergebnis:', data.iconUrl);
      }
    });
  }
}
