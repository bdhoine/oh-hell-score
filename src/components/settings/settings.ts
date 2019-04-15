import { Round } from './../../models/round';
import { Component } from '@angular/core';
import { ViewController, AlertController, App, NavParams } from 'ionic-angular';
import { RoundsProvider } from '../../providers/rounds/rounds';
import { SettingsProvider } from '../../providers/settings/settings';
import { GameSettings } from '../../models/gamesettings';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class SettingsComponent {

  cards: number[]
  settings: GameSettings;
  currentRound: number;

  constructor(
    public viewCtrl: ViewController, 
    public roundsProvider: RoundsProvider, 
    public alertCtrl: AlertController, 
    public appCtrl: App,
    public settingsProvider: SettingsProvider,
    public navParams: NavParams
  ) { 
    this.cards = [];
    this.currentRound = this.navParams.get('round');
    this.settings = this.settingsProvider.settings;
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewWillEnter() {
    this.generateAllowedCards(this.settings);
  }

  goingUp(): boolean {
    const rounds = this.roundsProvider.rounds;
    return (rounds.length / 2) > this.navParams.get('roundIndex') 
  }

  generateAllowedCards(settings: GameSettings) {
    const currentRounds = this.roundsProvider.rounds;
    const roundIndex = this.navParams.get('roundIndex');
    const round: Round = currentRounds[roundIndex];
    const players = round.state.length;

    this.cards = this.settingsProvider.getCardsToPlay(players, round.cards);
  }

  restart() {
    this.viewCtrl.dismiss();
    this.roundsProvider.restart(this.alertCtrl, this.appCtrl.getRootNav());
  }

  changeCardsToPlay(maxCardsAmount: number) {
    this.settings = {
      ...this.settings,
      maxCards: maxCardsAmount
    }
    this.roundsProvider.changeCardsToPlay(this.settings, this.navParams.get('roundIndex'));
  }

}
