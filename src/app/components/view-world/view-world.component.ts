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
  dragPos: any = null;

  constructor(public ms: MessageService,
              public globals: GlobalsService,
              public ds: DragService) {
    setTimeout(() => {
      let pos = 64;
      for (const link of globals.links) {
        if (link.x == null) {
          link.x = pos;
          link.y = pos;
          pos += 32;
        }
      }
    }, 1000);
  }

  get styleForContent(): any {
    const ret: { [key: string]: any } = {};
    // with this method (scale first, then translate) left and top are scaled coordinates => world coordinates
    ret['transform'] = `scale(${this.scale}) translate(${this.left}px,${this.top}px)`;
    // if (this.scale != 1.0) {
    //   ret['opacity'] = 0.7;
    // }
    return ret;
  }

  @HostListener('wheel', ['$event'])
  public onScroll(evt: WheelEvent) {
    const screen = {
      x: evt.clientX,
      y: evt.clientY
    };
    const world = {
      x: screen.x / this.scale - this.left,
      y: screen.y / this.scale - this.top,
    };

    let diff = -Math.sign(evt.deltaY) / 10;
    if (this.scale < 0.2) {
      diff /= 10;
    }
    if (this.scale + diff > 0.01 && this.scale + diff < 5.0) {
      this.scale += diff;
    }
    this.scale = +this.scale.toPrecision(3);

    this.setPos(
      screen.x / this.scale - world.x,
      screen.y / this.scale - world.y
    );
    document.getElementsByTagName('body')[0].setAttribute('style', `--zoom:${this.scale}`);
  }

  allowDrop(evt: DragEvent) {
    evt.preventDefault();
  }

  onDrop(data: DragQueenData) {
    const link = data.data as LinkData;
    link.x = data.x - this.left;
    link.y = data.y - this.top;
    GLOBALS.saveSharedData();
  }

  setPos(x: number, y: number) {
    let xMax = -1000;
    let yMax = -1000;
    for (const entry of GLOBALS.links) {
      xMax = Math.max(entry.x, xMax);
      yMax = Math.max(entry.y, yMax);
    }
    xMax = xMax - (window.innerWidth - 250) / this.scale;
    yMax = yMax - (window.innerHeight - 250) / this.scale;
    if (-x > xMax && xMax) {
      x = -xMax;
    }
    if (-y > yMax) {
      y = -yMax;
    }
    if (x > 0) {
      x = 0;
    }
    if (y > 0) {
      y = 0;
    }
    this.left = x;
    this.top = y;
  }

  dragStart(x: number, y: number): void {
    if (this.dragPos == null) {
      this.dragPos = {x: x, y: y, left: this.left, top: this.top};
    }
  }

  dragMove(x: number, y: number): void {
    if (this.dragPos != null) {
      this.setPos(
        this.dragPos.left + (x - this.dragPos.x) / this.scale,
        this.dragPos.top + (y - this.dragPos.y) / this.scale
      );
    }
  }

  onTouchStart(evt: TouchEvent) {
    evt.stopPropagation();
    if (evt.touches?.length > 0) {
      this.dragStart(evt.touches[0].clientX, evt.touches[0].clientY);
    }
  }

  onTouchMove(evt: TouchEvent) {
    evt.stopPropagation();
    if (evt.touches?.length > 0) {
      this.dragMove(evt.touches[0].clientX, evt.touches[0].clientY);
    }
  }

  onTouchEnd(evt: TouchEvent) {
    evt.stopPropagation();
    this.dragPos = null;
  }

  onMouseDown(evt: MouseEvent) {
    evt.stopPropagation();
    this.dragStart(evt.clientX, evt.clientY);
  }

  onMouseMove(evt: MouseEvent) {
    evt.stopPropagation();
    this.dragMove(evt.clientX, evt.clientY);
  }

  onMouseUp(evt: MouseEvent) {
    evt.stopPropagation();
    this.dragPos = null;
  }
}
