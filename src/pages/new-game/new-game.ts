import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { RoundPage } from '../round/round';
import { PlayersProvider } from '../../providers/players/players';
import { SettingsProvider } from '../../providers/settings/settings';
import { RoundsProvider } from '../../providers/rounds/rounds';

@Component({
  selector: 'page-new-game',
  templateUrl: 'new-game.html'
})
export class NewGamePage {

  players:any;
  newPlayer:string;
  settings:any;
  cards:number[];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public playersProvider: PlayersProvider, public settingsProvider: SettingsProvider, public roundsProvider: RoundsProvider) {
    this.cards = Array(17).fill(1).map((x,i) => i+1);
    this.newPlayer = '';
    this.players = [];
    this.settings = {
      maxCards: 7
    };
  }

  ionViewWillEnter() {
    this.playersProvider.loadPlayers().then((players) => {
      this.players = players;
    });
    this.settingsProvider.loadSettings(this.settings).then((settings) => {
      this.settings = settings;
    });
  }

  ionViewWillLeave() {
    this.playersProvider.savePlayers(this.players);
    this.settingsProvider.saveSettings(this.settings);
  }

  addPlayer() {
    if (this.newPlayer.length > 0) {
      this.players.push(this.newPlayer);
      this.newPlayer = '';
    }
  }

  renamePlayer(item) {
    let prompt = this.alertCtrl.create({
      message: 'Enter new name for player: <b>' + item + '</b>',
      inputs: [
        {
          name: 'name',
          placeholder: 'New name..'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Rename',
          handler: data => {
            if (data.name.length > 0) {
              var index = this.players.indexOf(item, 0);
              if (index > -1) {
                this.players[index] = data.name;
              }
            }
          }
        }
      ]
    });
    prompt.present();
  }

  deletePlayer(item) {
    var index = this.players.indexOf(item, 0);
    if (index > -1) {
      this.players.splice(index, 1);
    }
  }

  reorderPlayers(event) {
    let player = this.players[event.from];
    this.players.splice(event.from, 1);
    this.players.splice(event.to, 0, player);
  }

  setDealer() {
    let alert = this.alertCtrl.create({
      title: 'Set dealer',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Start',
          handler: dealer => {
            if (typeof dealer != 'undefined') {
              this.roundsProvider.generateRounds(this.settings.maxCards, this.players, dealer);
              this.navCtrl.push(RoundPage, {
                round: 0
              });
            }
          }
        }
      ]
    });

    this.players.forEach(function(player) {
      alert.addInput({
        type: 'radio',
        label: player,
        value: player
      });
    });

    alert.present();
  }

  startGame() {
    this.setDealer();
  }

}
