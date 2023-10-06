export class RubikCubicle {
  // number of face that this plate is related to
  // on a solved cube
  u?: number = 0;
  d?: number = 0;
  l?: number = 0;
  r?: number = 0;
  b?: number = 0;
  f?: number = 0;

  static clone(src: RubikCubicle): RubikCubicle {
    return {
      u: src.u,
      d: src.d,
      l: src.l,
      r: src.r,
      b: src.b,
      f: src.f
    };
  }
}

export class RubikLayer {
  cubicles: RubikCubicle[] = [];

  static clone(src: RubikLayer): RubikLayer {
    const ret = new RubikLayer();
    src.cubicles.forEach(val => ret.cubicles.push(RubikCubicle.clone(val)));
    return ret;
  }
}

export class RubikCube {
  layers: RubikLayer[] = [
    {
      cubicles: [
        {u: 1, l: 2, b: 6},
        {u: 1, b: 6},
        {u: 1, r: 4, b: 6},
        {u: 1, l: 2},
        {u: 1},
        {u: 1, r: 4},
        {u: 1, l: 2, f: 3},
        {u: 1, f: 3},
        {u: 1, r: 4, f: 3},
      ]
    }, {
      cubicles: [
        {l: 2, b: 6},
        {b: 6},
        {r: 4, b: 6},
        {l: 2},
        {},
        {r: 4},
        {l: 2, f: 3, d: 5},
        {f: 3, d: 5},
        {r: 4, f: 3, d: 5},
      ]
    }, {
      cubicles: [
        {d: 5, l: 2, b: 6},
        {d: 5, b: 6},
        {d: 5, r: 4, b: 6},
        {d: 5, l: 2},
        {d: 5},
        {d: 5, r: 4},
        {d: 5, l: 2, f: 3},
        {d: 5, f: 3},
        {d: 5, r: 4, f: 3},
      ]
    }];

  colors = {
    0: {b: 'black', f: 'white'},
    1: {b: 'white', f: 'black'},
    2: {b: 'green', f: 'black'},
    3: {b: 'red', f: 'black'},
    4: {b: 'cornflowerblue', f: 'black'},
    5: {b: 'yellow', f: 'black'},
    6: {b: 'orange', f: 'black'},
  }

  constructor() {
  }

  face(dir: string): any[] {
    const ret: any[] = [];
    switch (dir) {
      case 'u':
        for (let c = 0; c < 9; c++) {
          ret.push({l: 0, c: c, n: this.c(0, c).u});
        }
        break;
      case 'd':
        for (const c of [6, 7, 8, 3, 4, 5, 0, 1, 2]) {
          ret.push({l: 2, c: c, n: this.c(2, c).d});
        }
        break;
      case 'l':
        for (const l of [0, 1, 2]) {
          for (const c of [0, 3, 6]) {
            ret.push({l: l, c: c, n: this.c(l, c).l});
          }
        }
        break;
      case 'r':
        for (const l of [0, 1, 2]) {
          for (const c of [8, 5, 2]) {
            ret.push({l: l, c: c, n: this.c(l, c).r});
          }
        }
        break;
      case 'f':
        for (const l of [0, 1, 2]) {
          for (const c of [6, 7, 8]) {
            ret.push({l: l, c: c, n: this.c(l, c).f});
          }
        }
        break;
      case 'b':
        for (const l of [0, 1, 2]) {
          for (const c of [2, 1, 0]) {
            ret.push({l: l, c: c, n: this.c(l, c).b});
          }
        }
        break;
    }

    return ret;
  }

  move(c: string): void {
    const moves: any = {
      R: [
        {src: {l: 0, c: 2}, dst: {l: 2, c: 2}, axis: 'x'},
        {src: {l: 0, c: 5}, dst: {l: 1, c: 2}, axis: 'x'},
        {src: {l: 0, c: 8}, dst: {l: 0, c: 2}, axis: 'x'},
        {src: {l: 1, c: 8}, dst: {l: 0, c: 5}, axis: 'x'},
        {src: {l: 1, c: 2}, dst: {l: 2, c: 5}, axis: 'x'},
        {src: {l: 2, c: 8}, dst: {l: 0, c: 8}, axis: 'x'},
        {src: {l: 2, c: 5}, dst: {l: 1, c: 8}, axis: 'x'},
        {src: {l: 2, c: 2}, dst: {l: 2, c: 8}, axis: 'x'}
      ],
      L: [
        {src: {l: 0, c: 0}, dst: {l: 0, c: 6}, axis: 'X'},
        {src: {l: 0, c: 3}, dst: {l: 1, c: 6}, axis: 'X'},
        {src: {l: 0, c: 6}, dst: {l: 2, c: 6}, axis: 'X'},
        {src: {l: 1, c: 0}, dst: {l: 0, c: 3}, axis: 'X'},
        {src: {l: 1, c: 6}, dst: {l: 2, c: 3}, axis: 'X'},
        {src: {l: 2, c: 0}, dst: {l: 0, c: 0}, axis: 'X'},
        {src: {l: 2, c: 3}, dst: {l: 1, c: 0}, axis: 'X'},
        {src: {l: 2, c: 6}, dst: {l: 2, c: 0}, axis: 'X'}
      ],
      U: [
        {src: {l: 0, c: 0}, dst: {l: 0, c: 2}, axis: 'z'},
        {src: {l: 0, c: 1}, dst: {l: 0, c: 5}, axis: 'z'},
        {src: {l: 0, c: 2}, dst: {l: 0, c: 8}, axis: 'z'},
        {src: {l: 0, c: 3}, dst: {l: 0, c: 1}, axis: 'z'},
        {src: {l: 0, c: 5}, dst: {l: 0, c: 7}, axis: 'z'},
        {src: {l: 0, c: 6}, dst: {l: 0, c: 0}, axis: 'z'},
        {src: {l: 0, c: 7}, dst: {l: 0, c: 3}, axis: 'z'},
        {src: {l: 0, c: 8}, dst: {l: 0, c: 6}, axis: 'z'}
      ],
      D: [
        {src: {l: 2, c: 6}, dst: {l: 2, c: 8}, axis: 'Z'},
        {src: {l: 2, c: 7}, dst: {l: 2, c: 5}, axis: 'Z'},
        {src: {l: 2, c: 8}, dst: {l: 2, c: 2}, axis: 'Z'},
        {src: {l: 2, c: 3}, dst: {l: 2, c: 7}, axis: 'Z'},
        {src: {l: 2, c: 5}, dst: {l: 2, c: 1}, axis: 'Z'},
        {src: {l: 2, c: 0}, dst: {l: 2, c: 6}, axis: 'Z'},
        {src: {l: 2, c: 1}, dst: {l: 2, c: 3}, axis: 'Z'},
        {src: {l: 2, c: 2}, dst: {l: 2, c: 0}, axis: 'Z'}
      ],
      F: [
        {src: {l: 0, c: 6}, dst: {l: 0, c: 8}, axis: 'y'},
        {src: {l: 0, c: 7}, dst: {l: 1, c: 8}, axis: 'y'},
        {src: {l: 0, c: 8}, dst: {l: 2, c: 8}, axis: 'y'},
        {src: {l: 1, c: 6}, dst: {l: 0, c: 7}, axis: 'y'},
        {src: {l: 1, c: 8}, dst: {l: 2, c: 7}, axis: 'y'},
        {src: {l: 2, c: 6}, dst: {l: 0, c: 6}, axis: 'y'},
        {src: {l: 2, c: 7}, dst: {l: 1, c: 6}, axis: 'y'},
        {src: {l: 2, c: 8}, dst: {l: 2, c: 6}, axis: 'y'}
      ],
      B: [
        {src: {l: 2, c: 0}, dst: {l: 2, c: 2}, axis: 'Y'},
        {src: {l: 2, c: 1}, dst: {l: 1, c: 2}, axis: 'Y'},
        {src: {l: 2, c: 2}, dst: {l: 0, c: 2}, axis: 'Y'},
        {src: {l: 1, c: 0}, dst: {l: 2, c: 1}, axis: 'Y'},
        {src: {l: 1, c: 2}, dst: {l: 0, c: 1}, axis: 'Y'},
        {src: {l: 0, c: 0}, dst: {l: 2, c: 0}, axis: 'Y'},
        {src: {l: 0, c: 1}, dst: {l: 1, c: 0}, axis: 'Y'},
        {src: {l: 0, c: 2}, dst: {l: 0, c: 0}, axis: 'Y'}
      ],
      E: [
        {src: {l: 1, c: 0}, dst: {l: 1, c: 6}, axis: 'Z'},
        {src: {l: 1, c: 3}, dst: {l: 1, c: 7}, axis: 'Z'},
        {src: {l: 1, c: 6}, dst: {l: 1, c: 8}, axis: 'Z'},
        {src: {l: 1, c: 7}, dst: {l: 1, c: 5}, axis: 'Z'},
        {src: {l: 1, c: 8}, dst: {l: 1, c: 2}, axis: 'Z'},
        {src: {l: 1, c: 5}, dst: {l: 1, c: 1}, axis: 'Z'},
        {src: {l: 1, c: 2}, dst: {l: 1, c: 0}, axis: 'Z'},
        {src: {l: 1, c: 1}, dst: {l: 1, c: 3}, axis: 'Z'}
      ],
      M: [
        {src: {l: 0, c: 1}, dst: {l: 0, c: 7}, axis: 'X'},
        {src: {l: 0, c: 4}, dst: {l: 1, c: 7}, axis: 'X'},
        {src: {l: 0, c: 7}, dst: {l: 2, c: 7}, axis: 'X'},
        {src: {l: 1, c: 7}, dst: {l: 2, c: 4}, axis: 'X'},
        {src: {l: 2, c: 7}, dst: {l: 2, c: 1}, axis: 'X'},
        {src: {l: 2, c: 4}, dst: {l: 1, c: 1}, axis: 'X'},
        {src: {l: 2, c: 1}, dst: {l: 0, c: 1}, axis: 'X'},
        {src: {l: 1, c: 1}, dst: {l: 0, c: 4}, axis: 'X'}
      ],
      S: [
        {src: {l: 0, c: 3}, dst: {l: 0, c: 5}, axis: 'y'},
        {src: {l: 0, c: 4}, dst: {l: 1, c: 5}, axis: 'y'},
        {src: {l: 0, c: 5}, dst: {l: 2, c: 5}, axis: 'y'},
        {src: {l: 1, c: 5}, dst: {l: 2, c: 4}, axis: 'y'},
        {src: {l: 2, c: 5}, dst: {l: 2, c: 3}, axis: 'y'},
        {src: {l: 2, c: 4}, dst: {l: 1, c: 3}, axis: 'y'},
        {src: {l: 2, c: 3}, dst: {l: 0, c: 3}, axis: 'y'},
        {src: {l: 1, c: 3}, dst: {l: 0, c: 4}, axis: 'y'}
      ]
    };
    const src: RubikLayer[] = [];
    this.layers.forEach(val => {
      src.push(RubikLayer.clone(val));
    });
    let isReverse = false;
    let list = moves[c];
    if (list == null) {
      list = moves[c.toUpperCase()];
      isReverse = true;
    }
    for (const move of list ?? []) {
      this._move(move, src, this.layers, isReverse);
    }
  }

  private _move(move: any, src: RubikLayer[], dst: RubikLayer[], isReverse: boolean): void {
    const s = isReverse ? move.dst : move.src;
    const d = isReverse ? move.src : move.dst;
    const cube: any = src[s.l].cubicles[s.c];
    dst[d.l].cubicles[d.c] = cube;
    let order;
    if (move.axis >= 'A' && move.axis <= 'Z') {
      isReverse = !isReverse;
    }
    switch (move.axis.toLowerCase()) {
      case 'x':
        order = isReverse ? 'bdfu' : 'ufdb';
        break;
      case 'y':
        order = isReverse ? 'rdlu' : 'uldr';
        break;
      case 'z':
        order = isReverse ? 'flbr' : 'rblf';
        break;
    }
    const t = cube[order[0]];
    for (let i = 0; i < 4; i++) {
      cube[order[i]] = cube[order[i + 1]];
    }
    cube[order[3]] = t;
    // dst[move.src.l].cubicles[move.src.c] = {l: 0, u: 0, r: 0, d: 0, b: 0, f: 0};
  }

  private c(l: number, c: number): RubikCubicle {
    return this.layers[l].cubicles[c];
  }
}
