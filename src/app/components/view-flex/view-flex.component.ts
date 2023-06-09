import {Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-view-flex',
  templateUrl: './view-flex.component.html',
  styleUrls: ['./view-flex.component.scss']
})
export class ViewFlexComponent {
  constructor(public globals: GlobalsService,
              public ds: DragService) {
  }
}
