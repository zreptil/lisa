import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';

@Component({
  selector: 'app-rubik-move',
  templateUrl: './rubik-move.component.html',
  styleUrls: ['./rubik-move.component.scss']
})
export class RubikMoveComponent {
  @Output()
  onMove = new EventEmitter<string>();
  @Input()
  move: string;
  @Input()
  reversed = false;

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

  constructor(public rs: RubikService) {
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
    ret.transform = `rotateX(${this.rotx}deg) rotateY(${this.roty}deg) rotateZ(${this.rotz}deg) translateX(0) translateY(0px) translateZ(0)`;
    for (const key of Object.keys(this.rs.cube.colors)) {
      ret[`--b${key}`] = this.rs.cube.colors[key].b;
      ret[`--f${key}`] = this.rs.cube.colors[key].f;
    }
    return ret;
  }

  styleForPlate(faceId: string, x: number, y: number): any {
    const face = this.rs.cube.face(faceId);
    let color = face[y * 3 + x].n;
    if (this.rs.hidden.find(h => h === `${faceId}${y * 3 + x}`)) {
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

  clickMove() {
    // const cubeOrg = RubikCube.clone(this.rs.cube);
    this.onMove.emit(this.move);
    //
    // for (let move of this.moves) {
    //   this.rs.cube.move(move);
    // }
    //
    // const hidden: string[] = [];
    // const faces = 'udlrfb';
    // for (let i = 0; i < faces.length; i++) {
    //   const plates = this.rs.cube.face(faces[i]);
    //   for (let n = 0; n < plates.length; n++) {
    //     const p = plates[n];
    //     if (RubikCubicle.equals(cubeOrg.c(p.l, p.c), this.rs.cube.c(p.l, p.c))) {
    //       hidden.push(`${faces[i]}${n}`);
    //     }
    //   }
    // }
    // this.rs.hidden = hidden;
  }
}
