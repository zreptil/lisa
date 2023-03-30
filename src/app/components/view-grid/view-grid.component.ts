import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-view-grid',
  templateUrl: './view-grid.component.html',
  styleUrls: ['./view-grid.component.scss']
})
export class ViewGridComponent {
  constructor(public globals: GlobalsService,
              public ds: DragService) {
  }

  get styleForGrid(): any {
    return {'--grid-columns': GLOBALS.viewConfig.gridColumns};
  }
}
