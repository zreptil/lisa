import {Injectable} from '@angular/core';
import {ProgressService} from '@/_services/progress.service';
import {Observable, Subscription} from 'rxjs';

export class Thumb {
  value: number;
  name: string;
  sameAs: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ThumblingService {

  // edges
  // 0  1  2  3    4  5  6  7    8  9  10 11
  // fl fr br bl - dl dr ur ul - fu fd bd bu
  transforms: any = [
    {count: 3, values: [1, 2, 3, 0, 9, 10, 11, 8, 6, 5, 4, 7]},
    {count: 3, values: [7, 6, 5, 4, 0, 1, 2, 3, 11, 8, 9, 10]},
    {count: 3, values: [8, 9, 10, 11, 7, 4, 5, 6, 1, 0, 3, 2]},
    {count: 1, values: [1, 0, 3, 2, 5, 4, 7, 6, 8, 9, 10, 11]},
    {count: 1, values: [3, 2, 1, 0, 4, 5, 6, 7, 11, 10, 9, 8]},
    {count: 1, values: [0, 1, 2, 3, 7, 6, 5, 4, 9, 8, 11, 10]}
  ];
  firstSubscription: Subscription;

  constructor(public ps: ProgressService) {
  }

  public calcVariations(): Observable<Thumb[]> {
    return new Observable<Thumb[]>((observer) => {
      this.ps.init({
        progressPanelBack: 'red',
        progressPanelFore: 'lime',
        progressBarColor: 'aqua'
      });
      this.ps.text = $localize`Verarbeite mögliche Thumbs ...`;
      this.ps.max = 4095;
      const list: Thumb[] = [];
      for (let i = 0; i <= this.ps.max && this.ps.next(); i++) {
        if (this.isValidThumb(i)) {
          let sameAs: number[] = [];
          let found = false;
          for (let j = 0; j < list.length && !found; j++) {
            // for (const v of this.listThumbs) {
            const v = list[j];
            if (this.equals(i, v.value)) {
              v.sameAs.push(i);
              // sameAs.push(v.value);
              found = true;
            }
          }
          if (!found) {
            list.push({value: i, name: this.nameFor(i), sameAs: sameAs});
            observer.next(list);
          }
        }
      }
      this.ps.cancel();
      // console.log(list);
      observer.next(list);
      observer.complete();
    });
  }

  setNames(list: Thumb[]): void {
    for (const thumb of list) {
      thumb.name = this.nameFor(thumb.value);
      if (thumb.name == null) {
        for (const v of thumb.sameAs) {
          if (this.nameFor(v) != null) {
            thumb.name = '*' + this.nameFor(v);
          }
        }
      }
    }
  }

  public cvtDec2Bin(v: number): number[] {
    const ret: number[] = [];
    for (let i = 1; i < 4096; i *= 2) {
      ret.push((v & i) === i ? 1 : 0);
    }
    return ret.reverse();
  }

  public cvtBin2Dec(v: number[]): number {
    let ret: number = 0;
    for (const i of v) {
      ret = (ret * 2) + i;
    }
    return ret;
  }

  nameFor(value: number): string {
    const names: any = {
      3974: 'yyshape',
      4038: 'wshape',
      3543: 'gshape',
      1015: 'tshape',
      1014: 'tshapebig',
      3314: 'tshape6',
      2806: 'sshape',
      2789: 'zigzag6',
      3254: 'hand',
      1694: 'snake',
      431: 'waves',
      1020: 'lock',
      375: 'hand1',
      382: 'spiral',
      1998: 'hand2',
      1375: 'across',
      439: 'ushape90'
    };
    return names[`${value}`];
  }

  private isValidThumb(value: number): boolean {
    const bin = this.cvtDec2Bin(value);
    const visited = [false, false, false, false, false, false, false, false];
    this.visitCorner(0, bin, visited);
    for (const v of visited) {
      if (!v) {
        return false;
      }
    }

    return value !== 4095;
  }

  /**
   * Checks the edges that are connected to the given corner. If an edge
   * is available then the corner at the other end is also checked. At the
   * end visited will contain true for the corners that are reachable
   * from the given corner
   *
   * @param corner   index of corner to check
   * @param edges    edges that are set (1 = edge available, 0 = no edge)
   * @param visited  corners that were visited up to now
   */
  private visitCorner(corner: number, edges: number[], visited: boolean[]): void {
    if (visited[corner]) {
      return;
    }
    visited[corner] = true;
    // edges
    // 0  1  2  3    4  5  6  7    8  9  10 11
    // fl fr br bl - dl dr ur ul - fu fd bd bu
    // corners
    // 0   1   2   3   4   5   6   7
    // flu fru bru blu fld frd brd bld
    const corners = [
      [0, 7, 8], // 0
      [1, 6, 8], // 1
      [2, 6, 11], // 2
      [3, 7, 11], // 3
      [0, 4, 9], // 4
      [1, 5, 9], // 5
      [2, 5, 10], // 6
      [3, 4, 10], // 7
    ];
    const edgePaths = [
      [0, 4], // corner 0 to corner 4
      [1, 5],
      [2, 6],
      [3, 7],

      [4, 7],
      [5, 6],
      [1, 2],
      [0, 3],

      [0, 1],
      [4, 5],
      [6, 7],
      [2, 3],
    ];

    for (const c of corners[corner]) {
      if (edges[c] === 1) {
        this.visitCorner(edgePaths[c][0], edges, visited);
        this.visitCorner(edgePaths[c][1], edges, visited);
      }
    }
  }

  /**
   * Checks, if the first value will result in the same configuration of the cube as
   * the second value when rotating or mirroring the first.
   *
   * @param v1 first value
   * @param v2 second value
   * @param start first index of transforms to use
   * @returns true, if v1 can be transformed to v2
   */
  private equals(v1: number, v2: number, start = 0): boolean {
    if (start >= this.transforms.length) {
      return false;
    }
    const src = this.cvtDec2Bin(v1);
    for (let idx = start; idx < this.transforms.length; idx++) {
      const trans = this.transforms[idx];
      // console.log(start, trans);
      let s = src; // .map(e => e);
      for (let i = 0; i < trans.count; i++) {
        const check = [];
        for (let j = 0; j < trans.values.length; j++) {
          check.push(s[trans.values[j]]);
        }
        // console.log(check);
        const v3 = this.cvtBin2Dec(check);
        if (v3 === v2) {
          return true;
        }
        if (this.equals(v3, v2, start + 1)) {
          return true;
        }
        s = check;
      }
    }

    return false;
  }
}
