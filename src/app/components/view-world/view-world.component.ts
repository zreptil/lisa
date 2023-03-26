import {Component} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {GlobalsService} from '@/_services/globals.service';
import {DragService} from '@/_services/drag.service';
import {CdkDragDrop, CdkDragStart} from '@angular/cdk/drag-drop';
import {LinkData} from '@/_model/link-data';

@Component({
  selector: 'app-view-world',
  templateUrl: './view-world.component.html',
  styleUrls: ['./view-world.component.scss']
})
export class ViewWorldComponent {

  dragOffset: any;
  scale = 1.0;

  constructor(public ms: MessageService,
              public globals: GlobalsService,
              public ds: DragService) {
    setTimeout(() => {
      let x = 64;
      for (const link of globals.links) {
        if (link.x == null) {
          link.x = x;
          link.y = x;
          x += 32;
        }
      }
    }, 1000);
  }

  linkDropped(evt: CdkDragDrop<LinkData[]>) {
    if (this.ds.trashOpen) {
      this.ms.askDeleteLink(this.ds.dragLink).subscribe(_result => {
        this.ds.dragLink = null;
      });
      return;
    }
    // let parent = document.elementFromPoint(evt.dropPoint.x, evt.dropPoint.y);
    // while (parent != null && !parent.id?.startsWith('link-')) {
    //   parent = parent.parentElement;
    // }
    // if (parent == null) {
    //   this.ds.dragLink = null;
    //   return;
    // }
    this.ds.dragLink.x = Math.floor(((evt.event as MouseEvent).x - this.dragOffset.x) / this.scale);
    this.ds.dragLink.y = Math.floor(((evt.event as MouseEvent).y - this.dragOffset.y) / this.scale);
    // const dstIdx = +parent?.id.substring(5);
    // const srcIdx = this.ds.dragLink.index;
    // GLOBALS.moveLink(srcIdx, dstIdx);
    this.ds.dragLink = null;
  }

  calcPos(value: number): number {
    return Math.floor(value * this.scale);
  }

  dragstart(evt: CdkDragStart) {
    this.ds.dragLink = evt.source.data;
    this.ds.dragElement = evt.source.element?.nativeElement;
    this.dragOffset = {
      x: ((evt.event as MouseEvent).x - this.ds.dragLink.x) / this.scale,
      y: ((evt.event as MouseEvent).y - this.ds.dragLink.y) / this.scale
    };
  }

  styleForLink(link: LinkData): any {
    const ret: { [key: string]: any } = {};
    if (link.x != null) {
      ret['transform'] = `translate(${this.calcPos(link.x)}px,${this.calcPos(link.y)}px) scale(${this.scale})`;
      ret['left'] = '0px'; // `${this.calcPos(link.x)}px`;
      ret['top'] = '0px'; // `${this.calcPos(link.y)}px`;
    } else {
      console.log('scheisse hier!', link);
    }
    return ret;
  }
}
