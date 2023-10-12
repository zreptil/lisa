import {Component} from '@angular/core';
import {GLOBALS} from '@/_services/globals.service';

class Num {
  num: number;
  isPrime: boolean;
}

@Component({
  selector: 'app-view-prime-numbers',
  templateUrl: './view-prime-numbers.component.html',
  styleUrls: ['./view-prime-numbers.component.scss']
})
export class ViewPrimeNumbersComponent {

  primeList: Num[][];

  constructor() {
    this.initList();
  }

  initList(): void {
    const ret: Num[][] = [];
    const jMax = 100;
    for (let i = 0; i < 100; i++) {
      const row = [];
      for (let j = 0; j < jMax; j++) {
        for (const k of [1, 3, 7, 9]) {
          const n = i * jMax + j * 10 + k;
          row.push({num: n, isPrime: this.isPrime(n)});
        }
      }
      ret.push(row);
    }
    this.primeList = ret;
  }

  isPrime = (num: number) => {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
      if (num % i === 0) {
        return false;
      }
    }
    return true;
  }

  classForNum(num: Num): string[] {
    const ret: string[] = ['num'];
    if (num.isPrime) {
      ret.push('prime');
    }
    if (!GLOBALS.viewConfig.showPrimeNumbers) {
      ret.push('hidden');
    }
    return ret;
  }

  classForCell(num: Num): string[] {
    const ret: string[] = ['numColor'];
    if (num.isPrime) {
      ret.push('primeColor');
    }
    return ret;
  }
}
