import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  maxRounds:number = 13;

  constructor(public navCtrl: NavController) {
  }

}
