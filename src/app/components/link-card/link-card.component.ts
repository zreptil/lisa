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

  @Input()
  dragDisabled = false;

  constructor(public globals: GlobalsService,
              public ms: MessageService,
              public ds: DragService) {
  }

  get _dragDisabled(): boolean {
    return (GLOBALS.appMode !== 'edit' && GLOBALS.viewMode !== 'world') || this.dragDisabled;
  }

  clickIcon(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    if (link.children != null) {
      link.isOpen = !link.isOpen;
    }
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
        } else {
          link.isOpen = !link.isOpen;
        }
        break;
    }
  }

  clickDelete(evt: MouseEvent, link: LinkData) {
    evt.stopPropagation();
    this.ms.askDeleteLink(link);
  }

  classForChildren(parent: LinkData): string[] {
    const ret = ['children'];
    if (parent.isOpen) {
      ret.push('open');
    }
    return ret;
  }
}
