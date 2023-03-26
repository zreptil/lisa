import {Component, HostListener} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {LinkData} from '@/_model/link-data';
import {MessageService} from '@/_services/message.service';
import {ConfigLinkComponent} from '@/components/config-link/config-link.component';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  scale = 1.0;

  constructor(public globals: GlobalsService,
              public sync: SyncService,
              public ms: MessageService,
              public ds: DragService) {
  }

  get iconForView(): string {
    return GLOBALS.viewModes.find(v => v.id === GLOBALS.viewMode)?.icon ?? 'question_mark';
  }

  get classForMainpanel(): string[] {
    const ret: any = [];
    // if (this.trashOpen) {
    //   ret.push('trashing')
    // }
    return ret;
  }

  get classForHeader(): string[] {
    const ret = ['mat-elevation-z4'];
    if (GLOBALS.isDebug) {
      ret.push('debug');
    }
    return ret;
  }

  clickLocalTitle() {
    GLOBALS.isLocal = !GLOBALS.isLocal;
  }

  noImage(evt: ErrorEvent) {
    (evt.target as any).src = 'assets/images/empty.png';
  }

  clickAdd(evt: MouseEvent) {
    evt.stopPropagation();
    const link = new LinkData(null, null);
    this.ms.showPopup(ConfigLinkComponent, link);
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.saveSharedData();
    GLOBALS.appMode = 'standard';
  }

  mouseoverDelete(_evt: MouseEvent) {
    if (this.ds.dragLink != null) {
      this.ds.trashOpen = true;
    }
  }

  mouseoutDelete(_evt: MouseEvent) {
    this.ds.trashOpen = false;
  }

  @HostListener('wheel', ['$event'])
  public onScroll(evt: WheelEvent) {
    const diff = Math.sign(evt.deltaY) / 10;
    if (this.scale + diff > 0.1 && this.scale + diff < 2.0) {
      this.scale += diff;
    }
  }

  styleForView(): any {
    const ret: { [key: string]: any } = {};
    ret['transform'] = `translate(0px,0px) scale(${this.scale})`;
    return ret;
  }

  clickView(evt: MouseEvent) {
    evt.stopPropagation();
    let idx = GLOBALS.viewModes.findIndex(v => v.id === GLOBALS.viewMode);
    idx++;
    if (idx >= GLOBALS.viewModes.length) {
      idx = 0;
    }
    GLOBALS.viewMode = GLOBALS.viewModes[idx].id;
  }
}
