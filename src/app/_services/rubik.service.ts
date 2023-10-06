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

  constructor() {
  }
}
