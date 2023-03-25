import {Component, Inject} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LinkData} from '@/_model/link-data';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-config-link',
  templateUrl: './config-link.component.html',
  styleUrls: ['./config-link.component.scss']
})
export class ConfigLinkComponent {
  orgData: any;

  constructor(public globals: GlobalsService,
              public dlgRef: MatDialogRef<any>,
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
    if (this.data.url != null && Utils.isEmpty(this.data.label)) {
      const url = `https://corg.zreptil.de/?url=${this.data.url}`;
      GLOBALS.request(url, {options: {responseType: 'text'}}).then((response: any) => {
        console.log(response);
        const title = response?.body?.match(/<title>(.*)<\/title>/);
        console.log(title);
        if (title != null) {
          this.data.label = title?.[1];
        }
      });
    }
  }
}
