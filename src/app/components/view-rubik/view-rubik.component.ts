import {Component} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';

@Component({
  selector: 'app-view-rubik',
  templateUrl: './view-rubik.component.html',
  styleUrls: ['./view-rubik.component.scss']
})
export class ViewRubikComponent {

  constructor(public rs: RubikService) {
  }

  get moveButtons(): string[] {
    const moves = 'RLFUDBrlfudbEMSems';
    return moves.split('');
  }

  clickMove(c: string) {
    this.rs.cube.move(c);
  }
}
