import {Component, HostListener} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-view-rubik',
  templateUrl: './view-rubik.component.html',
  styleUrls: ['./view-rubik.component.scss']
})
export class ViewRubikComponent {
  iconForView: any = {
    'three-d': 'view_in_ar',
    'flat': 'check_box_outline_blank'
  };
  // https://rubiks-cube-solver.com
  // http://test.reptilefarm.ddns.net/rubik/
  view = 'three-d';
  rotx = -30;
  roty = 30;
  rotz = 0;
  _mouseDown: any = null;
  mode = 'colorize';
  currFace = 'u';

  constructor(public rs: RubikService) {
  }

  get styleForCube(): any {
    const ret: any = {};
    switch (this.view) {
      case 'three-d':
        ret.transform = `rotateX(${this.rotx}deg) rotateY(${this.roty}deg) rotateZ(${this.rotz}deg) translateX(0) translateY(0) translateZ(0)`;
        break;
    }
    return ret;
  }

  get moveButtons(): string[] {
    const moves = 'RLFUDBrlfudbEMSems';
    return moves.split('');
  }

  clickMove(c: string) {
    this.rs.cube.move(c);
  }

  faceFor(faceId: string, x: number, y: number): any {
    return this.rs.cube.face(faceId)[y * 3 + x];
  }

  styleForPlate(faceId: string, x: number, y: number): any {
    const face = this.rs.cube.face(faceId);
    let color = (this.rs.cube.colors as any)[`${face[y * 3 + x].n}`];
    if (this.rs.hidden.find(h => h === `${faceId}${y * 3 + x}`)) {
      color = this.rs.cube.colors[0];
    }
    return {
      backgroundColor: color?.b ?? 'purple',
      color: color?.f ?? 'yellow'
    }
  }

  textForPlate(faceId: string, x: number, y: number): string {
    const ret: any = [];
    switch (this.mode) {
      case 'debug':
        ret.push(`${this.faceFor(faceId, x, y).l}/${this.faceFor(faceId, x, y).c}`);
        break;
      case 'colorize':
        if (this.currFace === faceId) {
          ret.push(`${y * 3 + x + 1}`);
        }
        break;
    }
    return Utils.join(ret, '');
  }

  btnView() {
    let idx: number = null;
    const keys = Object.keys(this.iconForView);
    for (let i = 0; idx == null && i < keys.length; i++) {
      if (keys[i] === this.view) {
        idx = i;
      }
    }
    this.view = keys[idx != null && idx < keys.length - 1 ? idx + 1 : 0];
  }

  mouseDown(evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    this._mouseDown = {
      x: evt.x,
      y: evt.y,
      rotx: this.rotx,
      roty: this.roty,
      rotz: this.rotz
    };
  }

  mouseMove(evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    if (this._mouseDown != null) {
      this.rotx = this._mouseDown.rotx + (this._mouseDown.y - evt.y);
      this.roty = this._mouseDown.roty + (evt.x - this._mouseDown.x);
    }
  }

  mouseUp(_evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    this._mouseDown = null;
  }

  @HostListener('document:keypress', ['$event'])
  keydown(evt: KeyboardEvent) {
    switch (this.mode) {
      case 'colorize':
        if (+evt.key >= 1 && +evt.key <= 9) {
          this.rs.toggleHidden(this.currFace, +evt.key - 1);
          break;
        } else if ('ulfrbd'.indexOf(evt.key) >= 0) {
          this.currFace = evt.key;
        }
    }
  }
}
