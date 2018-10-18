import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewGamePage } from './new-game';

@NgModule({
  declarations: [
    NewGamePage
  ],
  imports: [
    IonicPageModule.forChild(NewGamePage)
  ],
  exports: [
    NewGamePage
  ]
})
export class NewGamePageModule {}
