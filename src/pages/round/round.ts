import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';
import { SettingsProvider } from '../../providers/settings/settings';

@Component({
  selector: 'page-round',
  templateUrl: 'round.html',
})
export class RoundPage {

  inProgress:boolean;
  round:any;
  rounds:any;
  roundIndex:number;
  settings:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public playersProvider: PlayersProvider, public roundsProvider: RoundsProvider, public settingsProvider: SettingsProvider) {
    this.roundIndex = this.navParams.get('round');
    this.round = {
      cards: 0,
      state: []
    }
  }

  ionViewWillEnter() {
    this.inProgress = false;

    this.roundsProvider.getRounds().then((rounds) => {
      this.rounds = rounds;
      this.round = rounds[this.roundIndex];
    });
  }

  ionViewWillLeave() {
    this.roundsProvider.saveRounds(this.rounds);
  }

  numberFromAlert(input):number {
    let number = Number(input);
    if (isNaN(number)){
      return 0;
    }
    else {
      return number;
    }
  }

  getTotal(key:string) {
    let total = 0;
    this.round.state.forEach(function(state) {
      total += state[key];
    });
    return total;
  }

  totalTrick():number {
    return this.getTotal('trick');
  }

  totalBid():number {
    return this.getTotal('bid');
  }

  isLastPlayer(player:string) {
    return this.round.state[this.round.state.length-1].player == player;
  }

  setBid(state) {
    if (this.inProgress === true) {
      return;
    }

    let alert = this.alertCtrl.create({
      title: 'Set bid',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            let bid = this.numberFromAlert(data);
            state.bid = bid;
          }
        }
      ]
    });

    for (var x = 0; x <= this.round.cards; x++) {
      if ((!this.isLastPlayer(state.player)) || (this.round.cards != this.totalBid() + x)) {
        alert.addInput({
          type: 'radio',
          label: x.toString(),
          value: x.toString()
        });
      }
    }

    alert.present();
  }

  setTrick(state) {
    if (this.inProgress === false) {
      return;
    }

    let alert = this.alertCtrl.create({
      title: 'Set trick',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            let trick = this.numberFromAlert(data);
            state.trick = trick;
          }
        }
      ]
    });

    Array(this.round.cards+1).fill(1).map((x, i) => i).forEach(function(trick) {
      alert.addInput({
        type: 'radio',
        label: trick.toString(),
        value: trick.toString()
      })
    });

    alert.present();
  }

  validateBids() {
    if (this.round.cards == this.totalBid()) {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Total bid can\'t be equal to the total number of cards',
        buttons: ['Close']
      });
      alert.present();
    }
    else {
      this.inProgress = true;
    }
  }

  validateTricks() {
    if (this.round.cards == this.totalTrick()) {
      this.roundsProvider.updateScore(this.rounds, this.roundIndex+1);
      this.navCtrl.push(RoundPage, {
        round: this.roundIndex+1,
      });
    }
    else {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Total tricks is ' + this.totalTrick() + ' but it should be ' + this.round.cards,
        buttons: ['Close']
      });
      alert.present();
    }
  }

  validateRound() {
    this.roundsProvider.saveRounds(this.rounds);
    if (this.inProgress === false) {
      this.validateBids();
    }
    else {
      this.validateTricks();
    }
  }

}
