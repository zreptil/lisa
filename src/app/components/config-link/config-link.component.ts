import {Component, Inject} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LinkData} from '@/_model/link-data';

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
    this.dlgRef.close({btn: 1});
  }
}
