import {Component} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';

@Component({
  selector: 'app-view-rubik',
  templateUrl: './view-rubik.component.html',
  styleUrls: ['./view-rubik.component.scss']
})
export class ViewRubikComponent {
  iconForView: any = {
    'three-d': 'view_in_ar',
    'flat': 'check_box_outline_blank'
  };
  // https://rubiks-cube-solver.com
  // http://test.reptilefarm.ddns.net/rubik/
  view = 'three-d';

  constructor(public rs: RubikService) {
  }

  get moveButtons(): string[] {
    const moves = 'RLFUDBrlfudbEMSems';
    return moves.split('');
  }

  clickMove(c: string) {
    this.rs.cube.move(c);
  }

  faceFor(faceId: string, x: number, y: number): any {
    return this.rs.cube.face(faceId)[y * 3 + x];
  }

  styleForPlate(faceId: string, x: number, y: number): any {
    const face = this.rs.cube.face(faceId);
    const color = (this.rs.cube.colors as any)[`${face[y * 3 + x].n}`];
    return {
      backgroundColor: color?.b ?? 'purple',
      color: color?.f ?? 'yellow'
    }
  }

  btnView() {
    let idx: number = null;
    const keys = Object.keys(this.iconForView);
    for (let i = 0; idx == null && i < keys.length; i++) {
      if (keys[i] === this.view) {
        idx = i;
      }
    }
    this.view = keys[idx != null && idx < keys.length - 1 ? idx + 1 : 0];
  }
}
