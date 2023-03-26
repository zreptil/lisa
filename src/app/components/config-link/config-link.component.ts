import {Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LinkData} from '@/_model/link-data';
import {Utils} from '@/classes/utils';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';

@Component({
  selector: 'app-config-link',
  templateUrl: './config-link.component.html',
  styleUrls: ['./config-link.component.scss']
})
export class ConfigLinkComponent {
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
    this.data = LinkData.fromJson(this.orgData);
    this.data.index = this.orgData.index;
    this.dlgRef.close({btn: 2});
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.data.index == null) {
      GLOBALS.insertLink(this.data);
    }
    this.dlgRef.close({btn: 1});
  }

  onLabelFocus(_evt: FocusEvent) {
    this.retrieveWebSiteData(this.data);
  }

  clickIcon(evt: MouseEvent) {
    evt.stopPropagation();
    this.retrieveWebSiteData(this.data, true);
  }

  retrieveWebSiteData(data: LinkData, forceUpdate = false) {
    const url = `https://corg.zreptil.de/?url=${data.url}`;
    GLOBALS.request(url, {options: {responseType: 'text'}}).then((response: any) => {
      if (Utils.isEmpty(data.label) || forceUpdate) {
        const title = response?.body?.match(/<title>(.*)<\/title>/);
        if (title != null) {
          data.label = title?.[1];
        }
      }
      if (Utils.isEmpty(data.iconUrl) || forceUpdate) {
        const icon = response?.body?.match(/<link(.*)rel="(shortcut icon|icon)"([^>]*)>/);
        console.log('icon', icon);
        if (icon?.length === 4) {
          const check = ` ${icon[0]} `;
          console.log('check', check);
          let found = check.match(/(.*)href="([^"]*)"(.*)/);
          console.log('url', found);
          if (found.length === 4) {
            let url = found[2];
            if (url.startsWith('//')) {
              url = `https:${url}`;
            }
            if (!url.startsWith('http:') && !url.startsWith('https:')) {
              url = `${data.url}/${url}`;
            }
            data.iconUrl = url;
            console.log('iconUrl', data.iconUrl);
          }
        } else {
          console.log('icon', response?.body, icon);
        }

        if (Utils.isEmpty(data.iconUrl)) {
          const url = 'https://zreptil.com';// data.url;
          GLOBALS.request(`https://corg.zreptil.de/?url=https://s2.googleusercontent.com/s2/favicons?domain=${url}`,
            {options: {responseType: 'text'}}).then((response: any) => {
            if (!Utils.isEmpty(response?.body)) {
              data.iconUrl = response?.body;
            } else {
              data.iconUrl = 'assets/images/favicon-unknown.png';
            }
            console.log('Da haben wir die Scheisse!', data.iconUrl);
            console.log(response);
          });
        }
      }
    });
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
}
