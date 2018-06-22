import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';

import { BidPage } from '../bid/bid';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';


@Component({
  selector: 'page-trick',
  templateUrl: 'trick.html',
})
export class TrickPage {

  round:any;
  rounds:any;
  roundIndex:number;

  constructor(
      public navParams: NavParams,
      public navCtrl: NavController,
      public alertCtrl: AlertController,
      public playersProvider: PlayersProvider,
      public roundsProvider: RoundsProvider
  ) {
    this.roundIndex = this.navParams.get('round');
    this.round = {
      cards: 0,
      state: []
    }
  }

  ionViewWillEnter() {
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

  totalTrick():number {
    let total = 0;
    this.round.state.forEach(function(state) {
      total += state.trick;
    });
    return total;
  }

  setTrick(state) {
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

    for (let x = 0; x <= this.round.cards; x++) {
      alert.addInput({
        type: 'radio',
        label: x.toString(),
        value: x.toString()
      })
    };

    alert.present();
  }

  validateTricks() {
    if (this.round.cards == this.totalTrick()) {
      if (this.roundIndex != this.rounds.length-1) {
        this.roundsProvider.updateScore(this.rounds, this.roundIndex+1);
        this.navCtrl.push(BidPage, {
          round: this.roundIndex+1,
        });
      }
      else {
        // TODO: Show final score
      }
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

}
