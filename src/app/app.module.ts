import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ColorPickerComponent} from '@/controls/color-picker/color-picker.component';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog';
import {ColorPickerImageComponent} from '@/controls/color-picker/color-picker-image/color-picker-image.component';
import {ColorPickerMixerComponent} from '@/controls/color-picker/color-picker-mixer/color-picker-mixer.component';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {ColorPickerRGBComponent} from '@/controls/color-picker/color-picker-rgb/color-picker-rgb.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {MainComponent} from '@/components/main/main.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from '@/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {LogComponent} from '@/components/log/log.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {ProgressComponent} from '@/components/progress/progress.component';
import {LinkCardComponent} from './components/link-card/link-card.component';
import {EditLinkComponent} from './components/edit-link/edit-link.component';
import {AutofocusDirective} from '@/_directives/autofocus.directive';
import {ViewFlexComponent} from './components/view-flex/view-flex.component';
import {ViewWorldComponent} from './components/view-world/view-world.component';
import {DragQueenComponent} from './controls/drag-queen/drag-queen.component';
import {ViewGridComponent} from './components/view-grid/view-grid.component';
import {NgOptimizedImage} from '@angular/common';
import { ViewThumblingComponent } from './components/view-thumbling/view-thumbling.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    AppComponent,
    DialogComponent,
    ColorPickerComponent,
    ColorPickerDialog,
    ColorPickerImageComponent,
    ColorPickerMixerComponent,
    ColorPickerBaseComponent,
    ColorPickerRGBComponent,
    WhatsNewComponent,
    MainComponent,
    WelcomeComponent,
    ImpressumComponent,
    LinkCardComponent,
    EditLinkComponent,
    ViewFlexComponent,
    ViewWorldComponent,
    DragQueenComponent,
    ViewGridComponent,
    ViewThumblingComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    DragDropModule,
    LogComponent,
    ProgressComponent,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
