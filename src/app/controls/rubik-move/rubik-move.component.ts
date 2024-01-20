import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';
import {RubikCube} from '@/_model/rubik-data';

@Component({
  selector: 'app-rubik-move',
  templateUrl: './rubik-move.component.html',
  styleUrls: ['./rubik-move.component.scss']
})
export class RubikMoveComponent {
  @Output()
  onMove = new EventEmitter<string>();
  @Input()
  reversed = false;
  @Input()
  name: string;

  cube: RubikCube = new RubikCube();
  cfg: any = {
    D: {icon: 'chevron_right', mc: 'bottom', face: 'f', 2: 'keyboard_double_arrow_right'},
    d: {icon: 'chevron_left', mc: 'bottom', face: 'f', 2: 'keyboard_double_arrow_left'},
    F: {icon: 'replay', ic: 'left', mc: 'center', face: 'f', 2: 'sync'},
    f: {icon: 'replay', ic: 'right', mc: 'center', face: 'f', 2: 'sync'},
    L: {icon: 'chevron_right', mc: 'left', ic: 'down', face: 'f', 2: 'keyboard_double_arrow_right'},
    l: {icon: 'chevron_right', mc: 'left', ic: 'up', face: 'f', 2: 'keyboard_double_arrow_right'},
    R: {icon: 'chevron_right', mc: 'right', ic: 'up', face: 'f', 2: 'keyboard_double_arrow_right'},
    r: {icon: 'chevron_right', mc: 'right', ic: 'down', face: 'f', 2: 'keyboard_double_arrow_right'},
    U: {icon: 'chevron_left', mc: 'top', face: 'f', 2: 'keyboard_double_arrow_left'},
    u: {icon: 'chevron_right', mc: 'top', face: 'f', 2: 'keyboard_double_arrow_right'},
    E: {icon: 'chevron_right', face: 'f', 2: 'keyboard_double_arrow_right'},
    e: {icon: 'chevron_left', face: 'f', 2: 'keyboard_double_arrow_left'},
    M: {icon: 'chevron_right', ic: 'down', face: 'f', 2: 'keyboard_double_arrow_right'},
    m: {icon: 'chevron_right', ic: 'up', face: 'f', 2: 'keyboard_double_arrow_right'},
    S: {icon: 'chevron_left', ic: 'up', face: 'r', 2: 'keyboard_double_arrow_left'},
    s: {icon: 'chevron_left', ic: 'down', face: 'r', 2: 'keyboard_double_arrow_left'},
    B: {icon: 'chevron_left', ic: 'right', mc: 'top', face: 'u', 2: 'keyboard_double_arrow_left'},
    b: {icon: 'chevron_left', ic: 'left', mc: 'top', face: 'u', 2: 'keyboard_double_arrow_left'},
  };
  // keyboard_double_arrow_right
  // keyboard_double_arrow_left
  // sync
  showMoves = false;

  constructor(public rs: RubikService) {
  }

  _move: string;

  get move(): string {
    return this._move;
  }

  @Input()
  set move(value: string) {
    this._move = value;
    this.cube = new RubikCube();
    for (const move of value?.split('') ?? []) {
      this.cube.move(move);
    }
  }

  get moves(): string[] {
    const ret = [];
    const temp = [];
    var i: number;
    if (this.reversed) {
      for (i = this.move?.length - 1; i >= 0; i--) {
        temp.push(Utils.toggleCase(this.move[i]));
      }
    } else {
      for (i = 0; i < this.move?.length; i++) {
        temp.push(this.move[i]);
      }
    }
    for (i = 0; i < temp.length; i++) {
      if (i < temp.length - 1 && temp[i] === temp[i + 1]) {
        ret.push(`${temp[i]}2`);
        i++;
      } else {
        ret.push(temp[i]);
      }
    }
    return ret;
  }

  get rotx(): number {
    return GLOBALS.viewConfig.rubikRotx;
  }

  get roty(): number {
    return GLOBALS.viewConfig.rubikRoty;
  }

  get rotz(): number {
    return GLOBALS.viewConfig.rubikRotz;
  }

  get styleForCube(): any {
    const ret: any = {};
    ret.transform = `rotateX(${this.rotx}deg) rotateY(${this.roty}deg) rotateZ(${this.rotz}deg) translateX(0) translateY(calc(var(--size) * -1)) translateZ(0)`;
    for (const key of Object.keys(this.cube.colors)) {
      ret[`--b${key}`] = this.cube.colors[key].b;
      ret[`--f${key}`] = this.cube.colors[key].f;
    }
    return ret;
  }

  styleForPlate(faceId: string, x: number, y: number): any {
    const face = this.cube.face(faceId);
    let color = face[y * 3 + x].n;
    if (color < 0) {
      color = 0;
    }
    return {
      backgroundColor: `var(--b${color ?? 0})`,
      color: `var(--f${color ?? 0})`
    }
  }

  faceForMove(moveId: string): string {
    return this.cfg[moveId[0]]?.face;
  }

  iconForMove(moveId: string): string {
    if (moveId.length === 2 && moveId[1] === '2') {
      return this.cfg[moveId[0]]?.['2'];
    }
    return this.cfg[moveId]?.icon;
  }

  classForMove(moveId: string): string[] {
    const ret: string[] = [];
    ret.push(this.cfg[moveId[0]]?.mc);
    return ret;
  }

  classForIcon(moveId: string): string[] {
    const ret: string[] = [];
    ret.push(this.cfg[moveId[0]]?.ic);
    return ret;
  }

  clickMove(evt: MouseEvent) {
    evt.stopPropagation();
    this.onMove.emit(this.move);
  }

  clickCube(evt: MouseEvent) {
    evt.stopPropagation();
    this.showMoves = !this.showMoves;
  }
}
