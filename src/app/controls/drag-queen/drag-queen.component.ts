import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

export class DragQueenData {
  constructor(public x: number,
              public y: number,
              public data: any) {
  }
}

@Component({
  selector: 'app-drag-queen',
  templateUrl: './drag-queen.component.html',
  styleUrls: ['./drag-queen.component.scss']
})
export class DragQueenComponent implements AfterViewInit {
  /**
   * x-position of the element.
   */
  @Input()
  x: number;

  /**
   * y-position of the element.
   */
  @Input()
  y: number;

  /**
   * if true, some information will be shown at the element.
   */
  @Input()
  isDebug = false;
  /**
   * the scale for calculation of positions. if this could be retrieved
   * automatically by looking in the transfer-styles of the parent
   * elements it would be obsolete at this place.
   */
  @Input()
  scale = 1.0;

  @Input()
  data: any;

  @Input()
  draggable = true;

  @Output()
  ondrop = new EventEmitter<DragQueenData>();

  mx: number;
  my: number;

  @ViewChild('dragGhost') ghost: ElementRef;
  @ViewChild('dragScaled') scaled: ElementRef;
  @ViewChild('source') source: ElementRef;

  constructor() {
  }

  /**
   * retrieve the style for the root-element.
   */
  get styleForRoot(): any {
    const ret: { [key: string]: any } = {};
    if (this.x != null) {
      ret['left'] = `${this.x}px`;
      ret['top'] = `${this.y}px`;
    }
    return ret;
  }

  get styleForGhost(): any {
    const ret: { [key: string]: any } = {};
    // ret['transform'] = `scale(${this.scale})`;
    ret['zoom'] = `${this.scale}`;
    return ret;
  }

  dragStart(evt: DragEvent) {
    if (!this.draggable) {
      evt.preventDefault();
      return;
    }
    evt.dataTransfer.setData('text', null);
    this.scaled.nativeElement.innerHTML = this.source.nativeElement.innerHTML;
    this.ghost.nativeElement.style.display = 'block';
    evt.dataTransfer.setDragImage(this.ghost.nativeElement, evt.offsetX * this.scale, evt.offsetY * this.scale);
    this.source.nativeElement.style.opacity = 0;
    this.mx = evt.offsetX * this.scale;
    this.my = evt.offsetY * this.scale;
  }

  dragEnd(evt: DragEvent) {
    this.ghost.nativeElement.style.display = 'none';
    this.source.nativeElement.style.opacity = 1;
    evt.dataTransfer.setDragImage(this.ghost.nativeElement, evt.offsetX * this.scale, evt.offsetY * this.scale);
    this.x = evt.clientX / this.scale - this.mx;
    this.y = evt.clientY / this.scale - this.my - 44 / this.scale;
    this.ondrop?.next(new DragQueenData(this.x, this.y, this.data));
  }

  ngAfterViewInit() {
    this.scaled.nativeElement.innerHTML = this.source.nativeElement.innerHTML;
  }
}
