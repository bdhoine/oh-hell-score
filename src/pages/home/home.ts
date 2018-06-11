import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { NewGamePage } from '../new-game/new-game';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
  }

  settings() {
    this.navCtrl.push(SettingsPage);
  }

  newGame() {
    this.navCtrl.push(NewGamePage);
  }

}
