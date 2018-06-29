import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';


@IonicPage()
@Component({
  selector: 'page-trick',
  templateUrl: 'trick.html',
})
export class TrickPage {

  round:any;
  rounds:any;
  roundIndex:number;
  totalTrick:number;

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
    };
    this.totalTrick = 0;
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

  calculateTotalTrick():number {
    let total = 0;
    this.round.state.forEach((state) => {
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
            this.totalTrick = this.calculateTotalTrick();
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
    if (this.round.cards == this.totalTrick) {
      if (this.roundIndex != this.rounds.length-1) {
        this.roundsProvider.updateScore(this.rounds, this.roundIndex);
        this.navCtrl.push('BidPage', {
          round: this.roundIndex+1,
        });
      }
      else {
        this.navCtrl.push('ScorePage');
      }
    }
    else {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Total tricks is ' + this.totalTrick + ' but it should be ' + this.round.cards,
        buttons: ['Close']
      });
      alert.present();
    }
  }

}
