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
  cube: RubikCube = new RubikCube();
  cfg: any = {
    D: {icon: 'east', mc: 'bottom', face: 'f'},
    d: {icon: 'west', mc: 'bottom', face: 'f'},
    F: {icon: 'replay', ic: 'left', mc: 'center', face: 'f'},
    f: {icon: 'replay', ic: 'right', mc: 'center', face: 'f'},
    L: {icon: 'east', mc: 'left', ic: 'down', face: 'f'},
    l: {icon: 'east', mc: 'left', ic: 'up', face: 'f'},
    R: {icon: 'east', mc: 'right', ic: 'up', face: 'f'},
    r: {icon: 'east', mc: 'right', ic: 'down', face: 'f'},
    U: {icon: 'west', mc: 'top', face: 'f'},
    u: {icon: 'east', mc: 'top', face: 'f'},
    E: {icon: 'east', face: 'f'},
    e: {icon: 'west', face: 'f'},
    M: {icon: 'east', ic: 'down', face: 'f'},
    m: {icon: 'east', ic: 'up', face: 'f'},
    S: {icon: 'west', ic: 'up', face: 'r'},
    s: {icon: 'west', ic: 'down', face: 'r'},
    B: {icon: 'west', ic: 'right', mc: 'top', face: 'u'},
    b: {icon: 'west', ic: 'left', mc: 'top', face: 'u'},
  };

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
    var i: number;
    if (this.reversed) {
      for (i = this.move?.length - 1; i >= 0; i--) {
        ret.push(Utils.toggleCase(this.move[i]));
      }
    } else {
      for (i = 0; i < this.move?.length; i++) {
        ret.push(this.move[i]);
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
    return this.cfg[moveId]?.face;
  }

  iconForMove(moveId: string): string {
    return this.cfg[moveId]?.icon;
  }

  classForMove(moveId: string): string[] {
    const ret: string[] = [];
    ret.push(this.cfg[moveId]?.mc);
    return ret;
  }

  classForIcon(moveId: string): string[] {
    const ret: string[] = [];
    ret.push(this.cfg[moveId]?.ic);
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
