import {Component, Input} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';

@Component({
  selector: 'app-rubik-face',
  templateUrl: './rubik-face.component.html',
  styleUrls: ['./rubik-face.component.scss']
})
export class RubikFaceComponent {
  @Input()
  face: string;

  constructor(public rs: RubikService) {
  }

  faceFor(x: number, y: number): any {
    return this.rs.cube.face(this.face)[y * 3 + x];
  }

  styleForPlate(x: number, y: number): any {
    const face = this.rs.cube.face(this.face);
    const color = (this.rs.cube.colors as any)[`${face[y * 3 + x].n}`];
    return {
      backgroundColor: color?.b ?? 'purple',
      color: color?.f ?? 'yellow'
    }
  }
}
