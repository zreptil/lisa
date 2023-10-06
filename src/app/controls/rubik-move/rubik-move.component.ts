import {Component, Input} from '@angular/core';

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

  get moves(): string[] {
    const ret = [];
    if (this.reversed) {
      for (var i = this.move?.length - 1; i >= 0; i--) {
        ret.push(this.cfg[this.move[i]].rev);
      }
    } else {
      for (var i = 0; i < this.move?.length; i++) {
        ret.push(this.move[i]);
      }
    }
    return ret;
  }

// Down
// Up
// Left
// Right
// Front
// Back
// Equator
// Middle
// Standing

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
}
