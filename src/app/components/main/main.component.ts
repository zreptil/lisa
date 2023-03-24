import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {LinkData} from '@/_model/link-data';
import {DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  dragLink: LinkData;
  dragElement: any;
  trashOpen = false;

  constructor(public globals: GlobalsService,
              public sync: SyncService,
              public ms: MessageService) {
  }

  get classForMainpanel(): string[] {
    const ret = [];
    if (this.trashOpen) {
      ret.push('trashing')
    }
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
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.saveSharedData();
    GLOBALS.appMode = 'standard';
  }

  linkDropped(evt: CdkDragDrop<LinkData[]>) {
    if (this.trashOpen) {
      this.ms.confirm($localize`Do you really want to delete this link?`).subscribe(result => {
        if (result.btn === DialogResultButton.yes) {
          GLOBALS.deleteLink(this.dragLink);
        }
        this.dragLink = null;
      });
      return;
    }
    let parent = document.elementFromPoint(evt.dropPoint.x, evt.dropPoint.y);
    while (parent != null && !parent.id?.startsWith('link-')) {
      console.log(parent);
      parent = parent.parentElement;
    }
    if (parent == null) {
      this.dragLink = null;
      return;
    }
    const dstIdx = +parent?.id.substring(5);
    const srcIdx = this.dragLink.index;
    console.log(evt, this.dragLink);
    GLOBALS.moveLink(srcIdx, dstIdx);
    this.dragLink = null;
  }

  dragstart(evt: CdkDragStart) {
    this.dragLink = evt.source.data;
    this.dragElement = evt.source.element?.nativeElement;
  }

  mouseoverDelete(_evt: MouseEvent) {
    if (this.dragLink != null) {
      this.trashOpen = true;
    }
  }

  mouseoutDelete(_evt: MouseEvent) {
    this.trashOpen = false;
  }
}
