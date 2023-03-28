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
    const dstUniqueId = +parent?.id.substring(5);
    const dst = GLOBALS.findLink(dstUniqueId);
    if (dst != null) {
      const src = GLOBALS.findLink(this.dragLink.uniqueId);
      if (dst.link.uniqueId === src.link.uniqueId
        || src.parent?.uniqueId === dst.link.uniqueId) {
        this.dragLink = null;
        return;
      }
      if (dst.list != null && dst.parent != null) {
        src.list?.splice(src.link.index, 1);
        dst.list.splice(dst.link.index, 0, src.link);
        console.log(src, '=>', dst);
        GLOBALS.setIndexToLinks();
        this.dragLink = null;
        return;
      }
      if (dst.link.children != null) {
        src.list?.splice(src.link.index, 1);
        dst.link.children.push(src.link);
        GLOBALS.setIndexToLinks();
        this.dragLink = null;
        return;
      }
      src.list?.splice(src.link.index, 1);
      dst.list.splice(dst.link.index, 0, src.link);
      GLOBALS.setIndexToLinks();
      console.log(src, ' ?=>', dst);
      // const srcIdx = this.dragLink.index;
      // GLOBALS.moveLink(srcIdx, dstIdx);
    }
    this.dragLink = null;
  }

  dragstart(evt: CdkDragStart) {
    this.dragLink = evt.source.data;
    this.dragElement = evt.source.element?.nativeElement;
  }
}
