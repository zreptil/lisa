import {Injectable} from '@angular/core';
import {LinkData} from '@/_model/link-data';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {GLOBALS} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';

@Injectable({
  providedIn: 'root'
})
export class DragService {
  dragLink: LinkData;
  dragElement: any;
  trashOpen = false;

  constructor(public ms: MessageService) {
  }

  linkDropped(evt: CdkDragDrop<LinkData[]>) {
    if (this.trashOpen) {
      this.ms.askDeleteLink(this.dragLink).subscribe(_result => {
        this.dragLink = null;
      });
      return;
    }
    let parent = document.elementFromPoint(evt.dropPoint.x, evt.dropPoint.y);
    while (parent != null && !parent.id?.startsWith('link-')) {
      parent = parent.parentElement;
    }
    if (parent == null) {
      this.dragLink = null;
      return;
    }
    const dstIdx = +parent?.id.substring(5);
    const lnk = GLOBALS.links.find(l => l.index === dstIdx);
    if (lnk === this.dragLink) {
      this.dragLink = null;
      return;
    }
    if (lnk.children != null) {
      lnk.children.push(this.dragLink);
      this.dragLink = null;
      return;
    }
    const srcIdx = this.dragLink.index;
    GLOBALS.moveLink(srcIdx, dstIdx);
    this.dragLink = null;
  }

  dragstart(evt: CdkDragStart) {
    this.dragLink = evt.source.data;
    this.dragElement = evt.source.element?.nativeElement;
  }
}
