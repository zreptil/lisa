import {Component} from '@angular/core';
import {Point} from '@angular/cdk/drag-drop';
import {ProgressService} from '@/_services/progress.service';
import {Thumb, ThumblingService} from '@/_services/thumbling.service';
import {LogService} from '@/_services/log.service';

class CubeData {
  currentVal: number;
  currentBin: number[];
  cube: Point = {x: 45, y: 30};
  cubeOrg: Point;
  down: Point = {x: -1, y: 0};
}

@Component({
  selector: 'app-view-thumbling',
  templateUrl: './view-thumbling.component.html',
  styleUrls: ['./view-thumbling.component.scss']
})
export class ViewThumblingComponent {
  listThumbs: Thumb[];
  cubeData = [new CubeData(), new CubeData()];
  currentData = this.cubeData[0];

  constructor(public ps: ProgressService,
              public ts: ThumblingService) {
    try {
      this.listThumbs = JSON.parse(localStorage.getItem('variations'));
      this.ts.setNames(this.listThumbs);
      this.activate(this.listThumbs?.[0].value, this.cubeData[0]);
    } catch (ex) {

    }
  }

  get singleCount(): number {
    return this.listThumbs?.filter(t => t.sameAs.length === 0)?.length
  }

  // 1982 1983 2047 4095
  get hasVariations(): boolean {
    return this.listThumbs != null && this.listThumbs?.length > 0;
  }

  // 351 367 375 382 383 415 439 447 511 861 863 877 879 885 887 892 893 894 895
  get currentThumb(): Thumb {
    return this.listThumbs?.find(t => t.value === this.currentData.currentVal);
  }

  cubeStyle(data: CubeData): any {
    return {
      // rotateX rotates around the x-axis why we use y-Movement as value
      // rotateY rotates around the y-axis why we use x-Movement as value
      transform: `rotateX(${-Math.floor(data.cube.y)}deg) rotateY(${Math.floor(data.cube.x)}deg)`
    };

  }

  // 1011 1013 1015 1020 1021 1023 1367 1375 1399 1405 1406 1407 1535 1911 1918 1919
  onLeave(_evt: MouseEvent, data: CubeData) {
    data.down.x = -1;
  }

  posForMouse(evt: MouseEvent): { x: number, y: number } {
    const x = evt.offsetX;
    const y = evt.offsetY;
    return {x: x, y: y};
  }

  onMove(evt: MouseEvent, data: CubeData) {
    if (data.down.x < 0) {
      return;
    }

    const pos = this.posForMouse(evt);
    let x = data.cubeOrg.x + (pos.x - data.down.x);
    let y = data.cubeOrg.y + (pos.y - data.down.y);
    while (x < 0) {
      x += 360;
    }
    while (x >= 360) {
      x -= 360;
    }
    while (y < 0) {
      y += 360;
    }
    while (y >= 360) {
      y -= 360;
    }
    data.cube.x = x;
    data.cube.y = y;
  }

  onMouseDown(evt: MouseEvent, data: CubeData) {
    data.cubeOrg = {...data.cube};
    data.down = this.posForMouse(evt);
  }

  classForArea(data: CubeData): string[] {
    const ret = ['cubeArea'];
    if (this.currentData === data) {
      ret.push('current');
    }
    return ret;
  }

  classForThumbling(value: number, data: CubeData): string[] {
    const ret = ['thumbling'];
    if (value === data.currentVal) {
      ret.push('current');
    }
    return ret;
  }

  getVariations(): void {
    this.listThumbs = [];
    setTimeout(() => {
      this.ts.calcVariations().subscribe((list: Thumb[]) => {
        this.listThumbs = list;
        for (const data of this.cubeData) {
          data.currentVal = this.listThumbs[0]?.value ?? 4095;
          data.currentBin = this.ts.cvtDec2Bin(data.currentVal);
        }
        this.ts.setNames(this.listThumbs);
        localStorage.setItem('variations', JSON.stringify(this.listThumbs));
        LogService.refreshUI();
      });
    }, 10);
  }

  fmtBin(bin: number[]): string {
    let ret = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        ret += `${bin[i * 4 + j]},`;
      }
      ret += ' '
    }
    return ret.substring(0, ret.length - 2);
  }

  classFor(type: string, data: CubeData): string[] {
    const ret = ['edge', type];
    const typeList = ['fl', 'fr', 'br', 'bl', 'dl', 'dr', 'ur', 'ul', 'fu', 'fd', 'bd', 'bu'];
    const idx = typeList.indexOf(type);
    if (idx >= 0 && idx < data.currentBin?.length) {
      if (data.currentBin[idx] === 0) {
        ret.push('hidden');
      }
    } else if (type.length === 1) {
      let count = 4;
      for (let i = 0; i < typeList.length; i++) {
        if (typeList[i].indexOf(type) >= 0 && data.currentBin?.[i] === 0) {
          count--;
        }
      }
      ret.push(`${count}`);
      if (count < 4) {
        ret.push('hidden');
      }
    }
    return ret;
  }

  activate(value: number, data: CubeData) {
    data.currentVal = value;
    data.currentBin = this.ts.cvtDec2Bin(data.currentVal);
    if (data === this.cubeData[0]) {
      this.cubeData[0].cube = {x: 45, y: 30};
      this.cubeData[1].cube = {x: 45, y: 30};
    }
  }

  openScadCmd(value: number) {
    return `__box([${this.fmtBin(this.ts.cvtDec2Bin(value))}],size);`;
  }
}
