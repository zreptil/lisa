import { Injectable } from '@angular/core';
import {registerLocaleData} from '@angular/common';
import enUS from '@angular/common/locales/en';
import enGB from '@angular/common/locales/en-GB';
import de from '@angular/common/locales/de';
import {loadTranslations} from '@angular/localize';
// import * as messages from '../../assets/messages.json';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor() { }

  activate(langCode: string) {
    const messages: any = {default: [{'id':'en-GB','data':{}}]}
    // const check = JSON.parse(localStorage.getItem('webData'))?.w1 || 'de-DE';
    let lng = (messages as any).default.find((lang: any) => lang.id === langCode);
    if (lng == null) {
      lng = (messages as any).default[0];
    }
    loadTranslations(lng.data);
    registerLocaleData(({
      'en-US': enUS,
      'en-GB': enGB,
      'de-DE': de,
    } as any)[lng.id]);
  }
}
