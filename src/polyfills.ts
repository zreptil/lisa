import '@angular/localize/init';
import 'zone.js';
import {LanguageService} from '@/_services/language.service';

const srv = new LanguageService();
srv.activate()
