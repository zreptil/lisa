import {Component, Input} from '@angular/core';
import {LinkData} from '@/_model/link-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {EditLinkComponent} from '@/components/edit-link/edit-link.component';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent {
  @Input()
  link: LinkData;

  @Input()
  type = 'card';

  @Input()
  mode = 'full';

  constructor(public globals: GlobalsService,
              public ms: MessageService,
              public ds: DragService) {
  }

  get dragDisabled(): boolean {
    return GLOBALS.appMode !== 'edit' && GLOBALS.viewMode !== 'world';
  }

  clickLink(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    switch (GLOBALS.appMode) {
      case 'edit':
        this.ms.showPopup(EditLinkComponent, link);
        break;
      default:
        if (link.children == null) {
          link.lastUsed = new Date().getTime();
          GLOBALS.saveSharedData();
          window.open(link.url);
        }
        break;
    }
  }

  clickDelete(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    this.ms.askDeleteLink(link);
  }
}
