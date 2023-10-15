export class RubikCubicle {
  // number of face that this plate is related to
  // on a solved cube
  u?: number = 0;
  d?: number = 0;
  l?: number = 0;
  r?: number = 0;
  b?: number = 0;
  f?: number = 0;
  inner?: boolean = false;

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

  static equals(a: RubikCubicle, b: RubikCubicle): boolean {
    return RubikCubicle.encode(a) === RubikCubicle.encode(b);
  }

  static encode(src: RubikCubicle): number {
    return (src.u ?? 0) * 100000 +
      (src.d ?? 0) * 10000 +
      (src.l ?? 0) * 1000 +
      (src.r ?? 0) * 100 +
      (src.b ?? 0) * 10 +
      (src.f ?? 0);
  }
}

export class RubikFace {
  l: number;
  c: number;
  n: number;
  cubicle: RubikCubicle;
}

export class RubikLayer {
  cubicles: RubikCubicle[] = [];

  static clone(src: RubikLayer): RubikLayer {
    const ret = new RubikLayer();
    src.cubicles.forEach(val => ret.cubicles.push(RubikCubicle.clone(val)));
    return ret;
  }
}

export class TurnDef {
  a: string;
  t: string;
}

export class RubikCube {
  movements: any[] = [{
    u6: 'lf',
    f6: 'ul',
    l0: 'lU',
    l6: 'ru',
    u8: 'rF',
    f8: 'uR',
    f24: 'dL',
    l24: 'rD',
    l18: 'ld',
    f26: 'dr',
    f15: 'le',
    f17: 'rE',
    f7: 'um',
    f25: 'dM',
    u3: 'ls',
    u5: 'rS',
    u0: 'lB',
    u2: 'rb',
    l9: 'le',
    l15: 'rE',
    u1: 'um',
    u7: 'dM',
    l3: 'uS',
    l21: 'ds',
    r26: 'ld',
    r20: 'rD',
    r23: 'dS',
    r5: 'us',
    r8: 'lU',
    r17: 'le',
    r2: 'ru',
    r11: 'rE',
    b2: 'ur',
    b1: 'uM',
    b0: 'uL',
    b20: 'dR',
    b19: 'dm',
    b18: 'dl',
    b11: 'le',
    b9: 'rE',
    d24: 'lF',
    d26: 'rf',
    d25: 'um',
    d19: 'dM',
    d21: 'lS',
    d23: 'rs',
    d20: 'rB',
    d18: 'lb'
  }, {
    u0: 'ul',
    l0: 'ub',
    b0: 'ru',
    u2: 'uR',
    r2: 'uB',
    b2: 'lU',
    f8: 'ru',
    u8: 'dr',
    r8: 'uf',
    u6: 'dL',
    l6: 'uF',
    f6: 'lU',
    l18: 'dB',
    b18: 'rD',
    d18: 'dL',
    b20: 'ld',
    d20: 'dr',
    r20: 'db',
    l24: 'df',
    f24: 'ld',
    d24: 'ul',
    f26: 'rD',
    r26: 'dF',
    d26: 'uR',
    u1: 'lB',
    b1: 'ru',
    u3: 'dL',
    l3: 'ru',
    u7: 'rF',
    f7: 'ru',
    u5: 'uR',
    r5: 'ru',
    b19: 'ld',
    d19: 'rB',
    l21: 'ld',
    d21: 'dL',
    r23: 'ld',
    d23: 'uR',
    f25: 'ld',
    d25: 'lF',
  }];
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
        {l: 2, b: 6, f: 3, r: 4, d: 5, u: 1, inner: true},
        {r: 4},
        {l: 2, f: 3},
        {f: 3},
        {r: 4, f: 3},
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

  colors: any = {
    0: {b: 'rgba(255,255,255,0.1)', f: 'rgba(255,255,255,0.8)'},
    1: {b: 'white', f: 'rgba(0,0,0,0.8)'},
    2: {b: 'green', f: 'rgba(0,0,0,0.8)'},
    3: {b: 'red', f: 'rgba(0,0,0,0.8)'},
    4: {b: 'rgb(64,64,255)', f: 'rgba(0,0,0,0.8)'},
    5: {b: 'yellow', f: 'rgba(0,0,0,0.8)'},
    6: {b: 'rgb(255,128,0)', f: 'rgba(0,0,0,0.8)'},
  }

  constructor() {
  }

  static clone(src: RubikCube): RubikCube {
    const ret = new RubikCube();
    ret.layers = [];
    src.layers.forEach(val => ret.layers.push(RubikLayer.clone(val)));
    return ret;
  }

  face(dir: string): RubikFace[] {
    const ret: any[] = [];
    let cuby;
    switch (dir) {
      case 'u':
        for (let c = 0; c < 9; c++) {
          cuby = this.c(0, c);
          ret.push({l: 0, c: c, n: cuby.u, cubicle: cuby});
        }
        break;
      case 'd':
        for (const c of [6, 7, 8, 3, 4, 5, 0, 1, 2]) {
          cuby = this.c(2, c);
          ret.push({l: 2, c: c, n: cuby.d, cubicle: cuby});
        }
        break;
      case 'l':
        for (const l of [0, 1, 2]) {
          for (const c of [0, 3, 6]) {
            cuby = this.c(l, c);
            ret.push({l: l, c: c, n: cuby.l, cubicle: cuby});
          }
        }
        break;
      case 'r':
        for (const l of [0, 1, 2]) {
          for (const c of [8, 5, 2]) {
            cuby = this.c(l, c);
            ret.push({l: l, c: c, n: cuby.r, cubicle: cuby});
          }
        }
        break;
      case 'f':
        for (const l of [0, 1, 2]) {
          for (const c of [6, 7, 8]) {
            cuby = this.c(l, c);
            ret.push({l: l, c: c, n: cuby.f, cubicle: cuby});
          }
        }
        break;
      case 'b':
        for (const l of [0, 1, 2]) {
          for (const c of [2, 1, 0]) {
            cuby = this.c(l, c);
            ret.push({l: l, c: c, n: cuby.b, cubicle: cuby});
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
        {src: {l: 1, c: 5}, dst: {l: 1, c: 5}, axis: 'x'},
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
        {src: {l: 1, c: 3}, dst: {l: 1, c: 3}, axis: 'X'},
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
        {src: {l: 0, c: 4}, dst: {l: 0, c: 4}, axis: 'z'},
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
        {src: {l: 2, c: 4}, dst: {l: 2, c: 4}, axis: 'Z'},
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
        {src: {l: 1, c: 7}, dst: {l: 1, c: 7}, axis: 'y'},
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
        {src: {l: 1, c: 1}, dst: {l: 1, c: 1}, axis: 'Y'},
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
        {src: {l: 1, c: 4}, dst: {l: 1, c: 4}, axis: 'Z'},
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
        {src: {l: 1, c: 4}, dst: {l: 1, c: 4}, axis: 'X'},
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
        {src: {l: 1, c: 4}, dst: {l: 1, c: 4}, axis: 'y'},
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

  public c(l: number, c: number): RubikCubicle {
    return this.layers[l].cubicles[c];
  }

  // https://www.youtube.com/watch?v=4-wu5Miyqrw
  blindName(faceId: string, l: number, c: number): string {
    let ret = '';
    const face = this.face(faceId);
    const idx = face.findIndex(f => f.l === l && f.c === c);
    if (idx >= 0) {
      const pos = [0, 0, 1, 3, -1, 1, 3, 2, 2][idx];
      if (pos >= 0) {
        const letter = pos + 'ulfrbd'.indexOf(faceId) * 4;
        ret = String.fromCharCode(letter + 65);
      }
    }
    return ret;
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
  }
}
