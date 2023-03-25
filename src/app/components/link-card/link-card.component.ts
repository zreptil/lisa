import {Component, Input} from '@angular/core';
import {LinkData} from '@/_model/link-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {ConfigLinkComponent} from '@/components/config-link/config-link.component';
import {DialogResultButton} from '@/_model/dialog-data';

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent {
  @Input()
  link: LinkData;

  constructor(public globals: GlobalsService,
              public ms: MessageService) {
  }

  clickLink(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    switch (GLOBALS.appMode) {
      case 'edit':
        this.ms.showPopup(ConfigLinkComponent, link);
        break;
      default:
        link.lastUsed = new Date().getTime();
        GLOBALS.saveSharedData();
        window.open(link.url);
        break;
    }
  }

  clickDelete(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    this.ms.confirm($localize`Do you really want to delete this link?`).subscribe(result => {
      if (result.btn === DialogResultButton.yes) {
        GLOBALS.deleteLink(link);
      }
    });
  }
}