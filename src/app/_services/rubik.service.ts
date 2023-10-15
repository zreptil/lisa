import {Injectable} from '@angular/core';
import {RubikCube} from '@/_model/rubik-data';

export class Face {
  id: number;
  rotation: number;
}

export class Cubicle {
  x: number;
  y: number;
  z: number;
}

@Injectable({
  providedIn: 'root'
})
export class RubikService {
  cube: RubikCube = new RubikCube();
  // face udlrfb
  // cubicle 00 - 27

  constructor() {
  }

  toggleHidden(faceId: string, cubicleIdx: number, set?: (n: number) => number): void {
    const l = Math.floor(cubicleIdx / 9);
    const c = cubicleIdx % 9;
    const cubicle = this.cube.layers[l].cubicles[c] as any;
    if (cubicle?.[faceId] != null) {
      cubicle[faceId] = set?.(cubicle[faceId]) ?? -cubicle[faceId];
    }
  }

  hasHidden(): boolean {
    return this.cube.layers.find(l => l.cubicles.find(c => {
      for (const key of Object.keys(c)) {
        if ((c as any)[key] < 0) {
          return c;
        }
      }
      return null;
    }) != null) != null;
  }

  clearHidden() {
    for (const l of [0, 1, 2]) {
      for (let c = 0; c < 9; c++) {
        for (const faceId of 'udlrfb'.split('')) {
          this.toggleHidden(faceId, l * 9 + c, (n) => Math.abs(n));
        }
      }
    }
  }

  reset(): void {
    this.cube = new RubikCube();
  }
}
