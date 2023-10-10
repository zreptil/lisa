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
  hidden: string[] = [];

  constructor() {
  }

  toggleHidden(face: string, n: number): void {
    const key = `${face}${n}`;
    const idx = this.hidden.findIndex(h => h === key);
    if (idx >= 0) {
      this.hidden.splice(idx, 1);
    } else {
      this.hidden.push(key);
    }
  }

  reset(): void {
    this.cube = new RubikCube();
    this.hidden = [];
  }
}
