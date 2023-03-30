import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {LinkData} from '@/_model/link-data';
import {MessageService} from '@/_services/message.service';
import {EditLinkComponent} from '@/components/edit-link/edit-link.component';
import {DragService} from '@/_services/drag.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  constructor(public globals: GlobalsService,
              public sync: SyncService,
              public ms: MessageService,
              public ds: DragService) {
  }

  get toolsForView(): any[] {
    return {
      grid: [{
        icon: 'add',
        click: () => {
          this.adjustGridColumns(1);
        }
      }, {
        icon: 'remove',
        click: () => {
          this.adjustGridColumns(-1);
        }
      }]
    }[GLOBALS.viewMode] ?? [];
  }

  get iconForView(): string {
    return GLOBALS.viewModes.find(v => v.id === GLOBALS.viewMode)?.icon ?? 'question_mark';
  }

  adjustGridColumns(diff: number): void {
    let value = GLOBALS.viewConfig.gridColumns += diff;
    GLOBALS.viewConfig.gridColumns = Math.min(8, Math.max(1, value));
    GLOBALS.saveSharedData();
  }

  clickAdd(evt: MouseEvent) {
    evt.stopPropagation();
    const link = new LinkData(null, null);
    this.ms.showPopup(EditLinkComponent, link);
  }

  clickAddGroup(evt: MouseEvent) {
    evt.stopPropagation();
    const link = new LinkData(null, null);
    link.children = [];
    this.ms.showPopup(EditLinkComponent, link);
  }

  clickEdit(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.appMode = 'edit'
    GLOBALS.saveSharedData();
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.appMode = 'standard';
    GLOBALS.saveSharedData();
  }

  mouseoverDelete(_evt: MouseEvent) {
    if (this.ds.dragLink != null) {
      this.ds.trashOpen = true;
    }
  }

  mouseoutDelete(_evt: MouseEvent) {
    this.ds.trashOpen = false;
  }

  clickView(evt: MouseEvent) {
    evt.stopPropagation();
    let idx = GLOBALS.viewModes.findIndex(v => v.id === GLOBALS.viewMode);
    idx++;
    if (idx >= GLOBALS.viewModes.length) {
      idx = 0;
    }
    GLOBALS.viewMode = GLOBALS.viewModes[idx].id;
    GLOBALS.saveSharedData();
  }

  clickDebug(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.isDebug = !GLOBALS.isDebug;
  }

  clickViewTool(evt: MouseEvent, tool: any) {
    evt.stopPropagation();
    tool.click();
  }
}
