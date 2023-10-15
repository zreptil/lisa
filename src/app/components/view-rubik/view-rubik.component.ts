import {Component, HostListener} from '@angular/core';
import {RubikService} from '@/_services/rubik.service';
import {Utils} from '@/classes/utils';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {animate, keyframes, style, transition, trigger} from '@angular/animations';
import * as htmlToImage from 'html-to-image';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {RubikCube, RubikCubicle} from '@/_model/rubik-data';

@Component({
  selector: 'app-view-rubik',
  templateUrl: './view-rubik.component.html',
  styleUrls: ['./view-rubik.component.scss'],
  animations: [
    trigger('doturn', [
        transition('_ => *', [
            animate('{{speed}}s', keyframes([
              style({transform: `{{from}}`}),
              style({transform: `{{to}}`})
            ]))
          ], {params: {from: '', to: '', speed: 0.2}}
        )
      ]
    )
  ]
})
// https://stackoverflow.com/questions/68191999/angular-animations-how-to-set-transition-timing-dynamically
export class ViewRubikComponent {
  icons: any = {
    view: {
      'three-d': 'view_in_ar',
      'flat': 'check_box_outline_blank'
    }, mode: {
      '': 'apps',
      'colorize': 'edit',
      'debug': 'bug_report'
    }, explode: {
      'yes': 'accessibility_new',
      'no': 'view_compact'
    }
  }
  // https://rubiks-cube-solver.com
  _mouseDown: any = null;
  cubicleSize = 50;
  explode = 'no';
  turnFaceId: string = '_';
  turnSequence = '';
  turnSpeed = 0.2;
  // http://test.reptilefarm.ddns.net/rubik/
  srcImage: string;
  keysDown = {
    shift: false,
    alt: false,
    ctrl: false
  };
  doRecord = false;
  sequenceRunning = false;
  protected readonly Utils = Utils;

  constructor(public rs: RubikService,
              public ms: MessageService,
              public globals: GlobalsService) {
  }

  get view(): string {
    return GLOBALS.viewConfig.rubikView;
  }

  set view(value: string) {
    GLOBALS.viewConfig.rubikView = value;
    GLOBALS.saveSharedData();
  }

  get rotx(): number {
    return GLOBALS.viewConfig.rubikRotx;
  }

  set rotx(value: number) {
    GLOBALS.viewConfig.rubikRotx = value;
  }

  get roty(): number {
    return GLOBALS.viewConfig.rubikRoty;
  }

  set roty(value: number) {
    GLOBALS.viewConfig.rubikRoty = value;
  }

  get rotz(): number {
    return GLOBALS.viewConfig.rubikRotz;
  }

  set rotz(value: number) {
    GLOBALS.viewConfig.rubikRotz = value;
  }

  get mode(): string {
    return GLOBALS.viewConfig.rubikMode;
  }

  set mode(value: string) {
    GLOBALS.viewConfig.rubikMode = value;
    GLOBALS.saveSharedData();
  }

  get styleForRoot(): any {
    const ret: any = {};
    switch (this.view) {
      case 'three-d':
        const s = this.cubicleSize * 5;
        ret.width = `${s}px`;
        ret.height = `${s}px`;
        break;
    }
    return ret;
  }

  get styleForCube(): any {
    const ret: any = {};
    switch (this.view) {
      case 'three-d':
        ret.transform = `translateX(-50%) translateY(-50%) translateZ(0) rotateX(${this.rotx}deg) rotateY(${this.roty}deg) rotateZ(${this.rotz}deg)`;
        ret['--cs'] = `${this.cubicleSize}px`;
        break;
    }
    for (const key of Object.keys(this.rs.cube.colors)) {
      ret[`--b${key}`] = this.rs.cube.colors[key].b;
      ret[`--f${key}`] = this.rs.cube.colors[key].f;
    }
    return ret;
  }

  get moveButtons(): string[] {
    const moves = 'LMRlmrUEDuedFSBfsb'; //'RLFUDBrlfudbEMSems';
    return moves.split('');
  }

  styleForCubicle(layer: number, idx: number): any {
    const size = this.cubicleSize;
    const y = layer * size;
    const x = (idx % 3) * size;
    const z = (Math.floor(idx / 3) - 1) * size;
    let ret: any = {
      '--plate-size': `${this.explode === 'yes' ? size / 1.5 : size}px`,
      transform: `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`
    };
    const add = this.moveAnimation(this.turnFaceId, layer, idx);
    if (add != null) {
      ret.transform += ' ' + add.transform;
      ret.transformOrigin = add.transformOrigin;
    }
    return ret;
  }

  faceFor(faceId: string, x: number, y: number): any {
    return this.rs.cube.face(faceId)[y * 3 + x];
  }

  styleForPlate(faceId: string, x: number, y: number): any {
    const face = this.rs.cube.face(faceId);
    let color = face[y * 3 + x].n;
    return this.styleForSticker(faceId, y * 3 + x, color);
  }

  styleForFace(faceId: string, cubicle: any, l: number, c: number): any {
    let color = cubicle[faceId];
    return this.styleForSticker(faceId, l * 9 + c, color);
  }

  styleForSticker(faceId: string, idx: number, color: number): any {
    if (color < 0) {
      color = 0;
    }
    const ret: any = {
      backgroundColor: `var(--b${color ?? 0})`,
      color: `var(--f${color ?? 0})`,
    }
    if (color == null) {
      ret['box-shadow'] = 'none';
    }
    return ret;
  }

  movementFor(faceId: string, l: number, c: number): string {
    let ret = this.rs.cube.movements[this.keysDown.ctrl ? 1 : 0][`${faceId}${l * 9 + c}`];
    if (ret != null && this.keysDown.shift) {
      let temp = '';
      switch (ret[0]) {
        case 'l':
          temp = 'r';
          break;
        case 'r':
          temp = 'l';
          break;
        case 'u':
          temp = 'd';
          break;
        case 'd':
          temp = 'u';
          break;
      }
      if (ret[1] >= 'a' && ret[1] <= 'z') {
        temp += ret[1].toUpperCase();
      } else {
        temp += ret[1].toLowerCase();
      }
      ret = temp;
    }
    return ret;
  }

  classForFace(faceId: string, l: number, c: number): string[] {
    const ret = [faceId];
    const cubicle = (this.rs.cube.c(l, c) as any);
    const def = this.movementFor(faceId, l, c);
    if (def != null) {
      ret.push(`a${def[0]}`);
    }
    if (cubicle.inner || cubicle?.[faceId] == null) {
      ret.push('inner');
    }
    return ret;
  }

  clickFace(faceId: string, l: number, c: number) {
    switch (this.mode) {
      case 'colorize':
        this.rs.toggleHidden(faceId, l * 9 + c);
        break;
      default:
        const def = this.movementFor(faceId, l, c);
        if (def != null) {
          if (this.doRecord) {
            if (GLOBALS.viewConfig.rubikRecorded.length > 0 && GLOBALS.viewConfig.rubikRecorded[GLOBALS.viewConfig.rubikRecorded.length - 1] === Utils.toggleCase(def[1])) {
              GLOBALS.viewConfig.rubikRecorded = GLOBALS.viewConfig.rubikRecorded.substring(0, GLOBALS.viewConfig.rubikRecorded.length - 1);
            } else {
              GLOBALS.viewConfig.rubikRecorded += def[1];
            }
            GLOBALS.saveSharedData();
          }
          this.turnFaceId = def[1];
        }
        break;
    }
  }

  textForPlate(faceId: string, x: number, y: number): string {
    const ret: any = [];
    switch (this.mode) {
      case 'debug':
        ret.push(`${this.faceFor(faceId, x, y).l}/${this.faceFor(faceId, x, y).c}`);
        break;
      case 'colorize':
        break;
    }
    return Utils.join(ret, '');
  }

  textForCubicle(faceId: string, l: number, c: number) {
    const ret: any = [];
    switch (this.mode) {
      case 'debug':
        ret.push(`${faceId}${l * 9 + c}`); //idx ?? '??');
        break;
      case 'colorize':
        break;
    }
    return Utils.join(ret, '');
  }

  toggle(key: string, value: any): any {
    let idx: number = null;
    const keys = Object.keys(this.icons[key]);
    for (let i = 0; idx == null && i < keys.length; i++) {
      if (keys[i] === value) {
        idx = i;
      }
    }
    return keys[idx != null && idx < keys.length - 1 ? idx + 1 : 0];
  }

  btnView() {
    this.view = this.toggle('view', this.view);
  }

  btnMode() {
    this.mode = this.toggle('mode', this.mode);
  }

  btnExplode() {
    this.explode = this.toggle('explode', this.explode);
  }

  mouseDown(evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    this._mouseDown = {
      x: evt.x,
      y: evt.y,
      rotx: this.rotx,
      roty: this.roty,
      rotz: this.rotz
    };
  }

  mouseMove(evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    if (this._mouseDown != null) {
      let rx = this._mouseDown.rotx + (this._mouseDown.y - evt.y);
      while (rx < 0) {
        rx += 360;
      }
      while (rx >= 360) {
        rx -= 360;
      }
      let ry;
      const x = evt.x;
      ry = this._mouseDown.roty + (x - this._mouseDown.x);
      if (rx > 90 && rx < 270) {
        const org = this._mouseDown.roty;
        ry = org - (x - this._mouseDown.x);
      }
      // while (ry < 0) {
      //   ry += 360;
      // }
      // while (ry >= 360) {
      //   ry -= 360;
      // }
      this.rotx = rx;
      this.roty = ry;
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // keypress(evt: KeyboardEvent) {
  //   switch (this.mode) {
  //     case 'colorize':
  //       if (+evt.key >= 1 && +evt.key <= 9) {
  //         this.rs.toggleHidden(this.currFace, +evt.key - 1);
  //         break;
  //       } else if ('ulfrbd'.indexOf(evt.key) >= 0) {
  //         this.currFace = evt.key;
  //       }
  //   }
  // }

  mouseUp(_evt: MouseEvent) {
    if (this.view !== 'three-d') {
      return;
    }
    this._mouseDown = null;
  }

  @HostListener('document:keydown', ['$event'])
  keydown(evt: KeyboardEvent) {
    this.keysDown.alt = evt.altKey;
    this.keysDown.shift = evt.shiftKey;
    this.keysDown.ctrl = evt.ctrlKey;
  }

  @HostListener('document:keyup', ['$event'])
  keyup(evt: KeyboardEvent) {
    this.keysDown.alt = evt.altKey;
    this.keysDown.shift = evt.shiftKey;
    this.keysDown.ctrl = evt.ctrlKey;
  }

  moveAnimation(faceId: string, layer: number, idx: number): any {
    if (faceId == null) {
      return null;
    }
    const factors: any = {
      U: {
        turn: 'rotateY',
        clockwise: false,
        0: {x: 1.5, y: 0, z: 1},
        1: {x: 0.5, y: 0, z: 1},
        2: {x: -0.5, y: 0, z: 1},
        3: {x: 1.5, y: 0, z: 0},
        4: {x: 0.5, y: 0, z: 0},
        5: {x: -0.5, y: 0, z: 0},
        6: {x: 1.5, y: 0, z: -1},
        7: {x: 0.5, y: 0, z: -1},
        8: {x: -0.5, y: 0, z: -1}
      }, E: {
        turn: 'rotateY',
        clockwise: true,
        9: {x: 1.5, y: 0, z: 1},
        10: {x: 0.5, y: 0, z: 1},
        11: {x: -0.5, y: 0, z: 1},
        12: {x: 1.5, y: 0, z: 0},
        13: {x: 0.5, y: 0, z: 0},
        14: {x: -0.5, y: 0, z: 0},
        15: {x: 1.5, y: 0, z: -1},
        16: {x: 0.5, y: 0, z: -1},
        17: {x: -0.5, y: 0, z: -1}
      }, D: {
        turn: 'rotateY',
        clockwise: true,
        18: {x: 1.5, y: 0, z: 1},
        19: {x: 0.5, y: 0, z: 1},
        20: {x: -0.5, y: 0, z: 1},
        21: {x: 1.5, y: 0, z: 0},
        22: {x: 0.5, y: 0, z: 0},
        23: {x: -0.5, y: 0, z: 0},
        24: {x: 1.5, y: 0, z: -1},
        25: {x: 0.5, y: 0, z: -1},
        26: {x: -0.5, y: 0, z: -1}
      }, L: {
        turn: 'rotateX',
        clockwise: false,
        0: {x: 0, y: 1.5, z: 1},
        3: {x: 0, y: 1.5, z: 0},
        6: {x: 0, y: 1.5, z: -1},
        9: {x: 0, y: 0.5, z: 1},
        12: {x: 0, y: 0.5, z: 0},
        15: {x: 0, y: 0.5, z: -1},
        18: {x: 0, y: -0.5, z: 1},
        21: {x: 0, y: -0.5, z: 0},
        24: {x: 0, y: -0.5, z: -1}
      }, M: {
        turn: 'rotateX',
        clockwise: false,
        1: {x: 0, y: 1.5, z: 1},
        4: {x: 0, y: 1.5, z: 0},
        7: {x: 0, y: 1.5, z: -1},
        10: {x: 0, y: 0.5, z: 1},
        13: {x: 0, y: 0.5, z: 0},
        16: {x: 0, y: 0.5, z: -1},
        19: {x: 0, y: -0.5, z: 1},
        22: {x: 0, y: -0.5, z: 0},
        25: {x: 0, y: -0.5, z: -1}
      }, R: {
        turn: 'rotateX',
        clockwise: true,
        2: {x: 0, y: 1.5, z: 1},
        5: {x: 0, y: 1.5, z: 0},
        8: {x: 0, y: 1.5, z: -1},
        11: {x: 0, y: 0.5, z: 1},
        14: {x: 0, y: 0.5, z: 0},
        17: {x: 0, y: 0.5, z: -1},
        20: {x: 0, y: -0.5, z: 1},
        23: {x: 0, y: -0.5, z: 0},
        26: {x: 0, y: -0.5, z: -1}
      }, F: {
        turn: 'rotateZ',
        clockwise: true,
        6: {x: 1.5, y: 1.5, z: 0},
        7: {x: 0.5, y: 1.5, z: 0},
        8: {x: -0.5, y: 1.5, z: 0},
        15: {x: 1.5, y: 0.5, z: 0},
        16: {x: 0.5, y: 0.5, z: 0},
        17: {x: -0.5, y: 0.5, z: 0},
        24: {x: 1.5, y: -0.5, z: 0},
        25: {x: 0.5, y: -0.5, z: 0},
        26: {x: -0.5, y: -0.5, z: 0}
      }, S: {
        turn: 'rotateZ',
        clockwise: true,
        3: {x: 1.5, y: 1.5, z: 0},
        4: {x: 0.5, y: 1.5, z: 0},
        5: {x: -0.5, y: 1.5, z: 0},
        12: {x: 1.5, y: 0.5, z: 0},
        13: {x: 0.5, y: 0.5, z: 0},
        14: {x: -0.5, y: 0.5, z: 0},
        21: {x: 1.5, y: -0.5, z: 0},
        22: {x: 0.5, y: -0.5, z: 0},
        23: {x: -0.5, y: -0.5, z: 0}
      }, B: {
        turn: 'rotateZ',
        clockwise: false,
        0: {x: 1.5, y: 1.5, z: 0},
        1: {x: 0.5, y: 1.5, z: 0},
        2: {x: -0.5, y: 1.5, z: 0},
        9: {x: 1.5, y: 0.5, z: 0},
        10: {x: 0.5, y: 0.5, z: 0},
        11: {x: -0.5, y: 0.5, z: 0},
        18: {x: 1.5, y: -0.5, z: 0},
        19: {x: 0.5, y: -0.5, z: 0},
        20: {x: -0.5, y: -0.5, z: 0}
      }
    };
    let f = factors[faceId]?.[layer * 9 + idx];
    let cw = factors[faceId]?.clockwise;
    if (f == null) {
      faceId = faceId.toUpperCase();
      f = factors[faceId]?.[layer * 9 + idx];
      cw = !factors[faceId]?.clockwise;
    }
    let ret: any = null;
    if (f != null) {
      const size = this.cubicleSize;
      ret = {
        transform: `${factors[faceId].turn}(${cw ? '' : '-'}90deg)`,
        transformOrigin: `${size * f.x}px ${size * f.y}px ${size * f.z}px`
      }
    }
    return ret;
  }

  turnCubicle(l: number, c: number): any {
    const size = this.cubicleSize;
    const diff = this.explode === 'yes' ? (size - size / 1.2) / 2 : 0;
    const y = l * size - diff;
    const x = (c % 3) * size + diff;
    const z = (Math.floor(c / 3) - 1) * size - diff;
    let ret: any = {
      '--plate-size': `${this.explode === 'yes' ? size / 1.5 : size}px`,
      transform: `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`
    };
    const add = this.moveAnimation(this.turnFaceId, l, c);
    if (add != null) {
      return {
        value: this.turnFaceId,
        params: {
          from: ret.transform,
          to: `${ret.transform} ${add.transform}`,
          speed: this.turnSpeed
        }
      };
    }
    return null;
  }

  applyTurn() {
    this.rs.cube.move(this.turnFaceId);
    this.turnFaceId = '_';
    this.turnSpeed = 0.2;
    if (this.turnSequence.length > 0) {
      setTimeout(() => this.doSequence(this.turnSequence, this.turnSpeed, false), 10);
    } else {
      this.sequenceRunning = false;
    }
  }

  btnHideUnchanged() {
    const cubeOrg = new RubikCube();
    if (this.rs.hasHidden()) {
      this.rs.clearHidden();
      return;
    }
    this.rs.clearHidden();
    for (const l of [0, 1, 2]) {
      for (let c = 0; c < 9; c++) {
        if (![4, 10, 12, 14, 16, 22].includes(l * 9 + c)) {
          if (RubikCubicle.equals(cubeOrg.c(l, c), this.rs.cube.c(l, c))) {
            for (const faceId of 'udlrfb'.split('')) {
              this.rs.toggleHidden(faceId, l * 9 + c);
            }
          }
        }
      }
    }
  }

  doSequence(moves: string, speed = 0.1, init: boolean = true) {
    if (init && this.sequenceRunning) {
      return;
    }
    this.sequenceRunning = true;
    switch (this.view) {
      case 'three-d':
        this.turnSpeed = speed;
        this.turnSequence = moves.substring(1);
        this.turnFaceId = moves.substring(0, 1);
        break;
      default:
        for (let move of moves) {
          this.rs.cube.move(move);
        }
        this.sequenceRunning = false;
        break;
    }
  }

  btnMix() {
    const moves = 'LRUDFB'.split('');
    const ret: string[] = [];
    for (let i = 0; i < 20; i++) {
      ret.push(moves[Math.floor(Math.random() * moves.length)]);
    }
    this.doSequence(Utils.join(ret, ''), 0.02, true);
  }

  async btnImage() {
    this.rotx = -30;
    this.roty = 30;
    this.rotz = 0;
    setTimeout(() => {
      const node = document.getElementById('cube');
      console.log(node);
      htmlToImage.toPng(node, {
        filter: (node) => {
          if (node.attributes?.getNamedItem('face') != null) {
            if (node.classList.contains('b')
              || node.classList.contains('d')
              || node.classList.contains('r')
              || node.classList.contains('inner')) {
              return false;
            }
          }
          return true;
        }
      }).then(
        (dataUrl) => {
          this.srcImage = dataUrl;
        }
      ).catch(error => {
        console.error('Das war wohl nix', error);
      });
    }, 1000);
  }

  btnRecord() {
    this.doRecord = !this.doRecord;
  }

  btnClearRecord() {
    this.ms.confirm($localize`Soll die Aufnahme gelöscht werden?`)
      .subscribe(result => {
        switch (result?.btn) {
          case DialogResultButton.yes:
            this.doRecord = false;
            GLOBALS.viewConfig.rubikRecorded = '';
            GLOBALS.saveSharedData();
            break;
        }
      });
  }
}
