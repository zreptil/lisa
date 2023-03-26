import {Component, HostListener} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {DragService} from '@/_services/drag.service';
import {LinkData} from '@/_model/link-data';
import {DragQueenData} from '@/controls/drag-queen/drag-queen.component';

@Component({
  selector: 'app-view-world',
  templateUrl: './view-world.component.html',
  styleUrls: ['./view-world.component.scss']
})
export class ViewWorldComponent {

  dragOffset: any;
  scale = 1.0;
  top = 0;
  left = 0;

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

  get styleForContent(): any {
    const ret: { [key: string]: any } = {};
    ret['transform'] = `translate(${this.left}px,${this.top}px) scale(${this.scale})`;
    if (this.scale != 1.0) {
      ret['opacity'] = 0.7;
    }
    return ret;
  }

  // linkDropped(evt: CdkDragDrop<LinkData[]>) {
  //   if (this.ds.trashOpen) {
  //     this.ms.askDeleteLink(this.ds.dragLink).subscribe(_result => {
  //       this.ds.dragLink = null;
  //     });
  //     return;
  //   }
  //   // let parent = document.elementFromPoint(evt.dropPoint.x, evt.dropPoint.y);
  //   // while (parent != null && !parent.id?.startsWith('link-')) {
  //   //   parent = parent.parentElement;
  //   // }
  //   // if (parent == null) {
  //   //   this.ds.dragLink = null;
  //   //   return;
  //   // }
  //   this.ds.dragLink.x = Math.floor(((evt.event as MouseEvent).x - this.dragOffset.x) / this.scale);
  //   this.ds.dragLink.y = Math.floor(((evt.event as MouseEvent).y - this.dragOffset.y) / this.scale);
  //   // const dstIdx = +parent?.id.substring(5);
  //   // const srcIdx = this.ds.dragLink.index;
  //   // GLOBALS.moveLink(srcIdx, dstIdx);
  //   this.ds.dragLink = null;
  // }
  //
  // calcPos(value: number): number {
  //   return Math.floor(value * this.scale);
  // }
  //
  // dragstart(evt: CdkDragStart) {
  //   this.ds.dragLink = evt.source.data;
  //   this.ds.dragElement = evt.source.element?.nativeElement;
  //   this.dragOffset = {
  //     x: ((evt.event as MouseEvent).x - this.ds.dragLink.x) / this.scale,
  //     y: ((evt.event as MouseEvent).y - this.ds.dragLink.y) / this.scale
  //   };
  // }
  //
  @HostListener('wheel', ['$event'])
  public onScroll(evt: WheelEvent) {
    let diff = -Math.sign(evt.deltaY) / 10;
    if (this.scale < 0.2) {
      diff /= 10;
    }
    if (this.scale + diff > 0.01 && this.scale + diff < 5.0) {
      this.scale += diff;
    }
    this.scale = +this.scale.toPrecision(3);
    document.getElementsByTagName('body')[0].setAttribute('style', `--zoom:${this.scale}`);
  }

  allowDrop(evt: DragEvent) {
    evt.preventDefault();
  }

  onDrop(data: DragQueenData) {
    const link = data.data as LinkData;
    link.x = data.x;
    link.y = data.y;
    GLOBALS.saveSharedData();
  }
}
