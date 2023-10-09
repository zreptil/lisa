import {Component, Input} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';
import {Utils} from '@/classes/utils';
import {RubikCube, RubikCubicle} from '@/_model/rubik-data';

@Component({
  selector: 'app-rubik-move',
  templateUrl: './rubik-move.component.html',
  styleUrls: ['./rubik-move.component.scss']
})
export class RubikMoveComponent {
  @Input()
  side: number;
  @Input()
  move: string;
  @Input()
  reversed = false;

  cfg: any = {
    D: {icon: 'east', mc: 'bottom', rev: 'd'},
    d: {icon: 'west', mc: 'bottom', rev: 'D'},
    F: {icon: 'replay', ic: 'left', mc: 'center', rev: 'f'},
    f: {icon: 'replay', ic: 'right', mc: 'center', rev: 'F'},
    L: {icon: 'east', mc: 'left', ic: 'down', rev: 'l'},
    l: {icon: 'east', mc: 'left', ic: 'up', rev: 'L'},
    R: {icon: 'east', mc: 'right', ic: 'up', rev: 'r'},
    r: {icon: 'east', mc: 'right', ic: 'down', rev: 'R'},
    U: {icon: 'west', mc: 'top', rev: 'u'},
    u: {icon: 'east', mc: 'top', rev: 'U'},
    E: {icon: 'east', rev: 'e'},
    e: {icon: 'west', rev: 'E'},
    M: {icon: 'east', ic: 'down', rev: 'm'},
    m: {icon: 'east', ic: 'up', rev: 'M'},
  };

  constructor(public rs: RubikService) {
  }

  get moves(): string[] {
    const ret = [];
    var i: number;
    if (this.reversed) {
      for (i = this.move?.length - 1; i >= 0; i--) {
        ret.push(this.cfg[this.move[i]].rev);
      }
    } else {
      for (i = 0; i < this.move?.length; i++) {
        ret.push(this.move[i]);
      }
    }
    return ret;
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
    const cubeOrg = RubikCube.clone(this.rs.cube);
    for (let move of this.moves) {
      this.rs.cube.move(move);
    }

    const hidden: string[] = [];
    const faces = 'udlrfb';
    for (let i = 0; i < faces.length; i++) {
      const plates = this.rs.cube.face(faces[i]);
      for (let n = 0; n < plates.length; n++) {
        const p = plates[n];
        if (RubikCubicle.equals(cubeOrg.c(p.l, p.c), this.rs.cube.c(p.l, p.c))) {
          hidden.push(`${faces[i]}${n}`);
        }
      }
    }
    this.rs.hidden = hidden;
    console.log(Utils.join(this.rs.hidden, ''));
  }
}
