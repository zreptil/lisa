import {Component, Input} from '@angular/core';
import {LinkData} from '@/_model/link-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {EditLinkComponent} from '@/components/edit-link/edit-link.component';
import {DragService} from '@/_services/drag.service';
import {Utils} from '@/classes/utils';

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
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public ms: MessageService,
              public ds: DragService) {
  }

  get folderIcon(): string {
    if (this.link.isOpen) {
      return 'folder_open';
    }
    return 'folder';
  }

  get classForDrag(): string[] {
    const ret = [];
    if (GLOBALS.appMode === 'edit') {
      if (this.isCurrentFolder) {
        ret.push('current');
      }
    }
    return ret;
  }

  get _dragDisabled(): boolean {
    return (GLOBALS.appMode !== 'edit' && GLOBALS.viewMode !== 'world') || this.dragDisabled;
  }

  get isCurrentFolder(): boolean {
    return GLOBALS.currentFolder?.uniqueId === this.link.uniqueId;
  }

  clickIcon(evt: MouseEvent, link: LinkData, callLink = false) {
    evt.stopPropagation();
    if (link.children != null) {
      link.isOpen = !link.isOpen;
      if (this.isCurrentFolder && !link.isOpen) {
        GLOBALS.currentFolder = null;
      } else {
        GLOBALS.currentFolder = link;
      }
    } else if (callLink) {
      this.clickLink(evt, link);
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

  clickAdd(evt: MouseEvent, parent: LinkData) {
    evt.stopPropagation();
    const link = new LinkData(null, null);
    GLOBALS.currentFolder = parent;
    this.ms.showPopup(EditLinkComponent, link);
  }
}
