import {Injectable} from '@angular/core';
import {LinkData} from '@/_model/link-data';

@Injectable({
  providedIn: 'root'
})
export class DragService {
  dragLink: LinkData;
  dragElement: any;
  trashOpen = false;

  constructor() {
  }
}
