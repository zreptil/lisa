import {CrowdinData} from '@/_model/crowdin-data';

export class LangData {
  constructor(public code: string, public name: string, public img: string, public crowdin: CrowdinData) {
    if (crowdin != null) {
      crowdin.langName = name;
      const parts = code.toLowerCase().split('-');
      if (parts[0] === parts[1]) {
        crowdin.langCode = parts[0];
      } else {
        crowdin.langCode = `${parts[0]}${parts[1]}`;
      }
    }
  }

  get is24HourFormat(): boolean {
    switch (this.code) {
      case 'en-US':
      case 'en-GB':
        return false;
      default:
        return true;
    }
  }

  get imgPath(): String {
    return `assets/images/lang-${this.img}.png`;
  }
}
