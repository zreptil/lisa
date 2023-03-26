import {Component} from '@angular/core';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {LinkData} from '@/_model/link-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-view-flex',
  templateUrl: './view-flex.component.html',
  styleUrls: ['./view-flex.component.scss']
})
export class ViewFlexComponent {
  constructor(public ms: MessageService,
              public globals: GlobalsService,
              public ds: DragService) {
  }

  linkDropped(evt: CdkDragDrop<LinkData[]>) {
    if (this.ds.trashOpen) {
      this.ms.askDeleteLink(this.ds.dragLink).subscribe(_result => {
        this.ds.dragLink = null;
      });
      return;
    }
    let parent = document.elementFromPoint(evt.dropPoint.x, evt.dropPoint.y);
    while (parent != null && !parent.id?.startsWith('link-')) {
      parent = parent.parentElement;
    }
    if (parent == null) {
      this.ds.dragLink = null;
      return;
    }
    const dstIdx = +parent?.id.substring(5);
    const srcIdx = this.ds.dragLink.index;
    GLOBALS.moveLink(srcIdx, dstIdx);
    this.ds.dragLink = null;
  }

  dragstart(evt: CdkDragStart) {
    this.ds.dragLink = evt.source.data;
    this.ds.dragElement = evt.source.element?.nativeElement;
  }
}
