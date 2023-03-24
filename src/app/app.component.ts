import {ChangeDetectorRef, Component} from '@angular/core';
import {LogService} from '@/_services/log.service';
import {SyncService} from '@/_services/sync/sync.service';
import {StorageService} from '@/_services/storage.service';
import {EnvironmentService} from '@/_services/environment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(ss: StorageService,
              cr: ChangeDetectorRef,
              _sync: SyncService,
              public env: EnvironmentService) {
    LogService.cr = cr;
  }
}
