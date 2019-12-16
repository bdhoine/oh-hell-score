import { Round } from './../../models/round';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, Alert } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';

@IonicPage()
@Component({
  selector: 'page-bid',
  templateUrl: 'bid.html',
})
export class BidPage {

  round: Round;
  rounds: Round[];
  roundIndex: number;
  totalBid: number;

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
    this.totalBid = 0;
  }

  get bidNotAllowed() {
    return this.round.cards - this.totalBid;
  }

  getRounds() {
    this.roundsProvider.getRounds().then((rounds: Round[]) => {
      this.rounds = rounds;
      this.round = rounds[this.roundIndex];
    });
  }

  ionViewWillEnter() {
    this.getRounds()
  }

  ionViewWillLeave() {
    this.roundsProvider.saveRounds(this.rounds);
  }

  numberFromAlert(input): number {
    let number = Number(input);
    if (isNaN(number)) {
      return 0;
    } else {
      return number;
    }
  }

  calculateTotalBid(): number {
    let total = 0;
    this.round.state.forEach((state) => {
      total += state.bid;
    });
    return total;  }

  isLastPlayer(player: string) {
    return this.round.state[this.round.state.length-1].player == player;
  }

  addBidCount(alert: Alert, state) {
    for (var x = 0; x <= this.round.cards; x++) {
      if ((!this.isLastPlayer(state.player)) || (this.round.cards != this.totalBid + x)) {
        alert.addInput({
          type: 'radio',
          label: x.toString(),
          value: x.toString(),
          handler: (data) => {
            let bid = this.numberFromAlert(data.value);
            state.bid = bid;
            this.totalBid = this.calculateTotalBid();
            alert.dismiss();
          }
        });
      }
    }
  }

  setBid(state) {
    let alert = this.alertCtrl.create({
      title: 'Set bid',
      buttons: [
        {
          text: 'Cancel'
        }
      ]
    });

    this.addBidCount(alert, state);

    alert.present();
  }

  validateBids() {
    if (this.round.cards == this.totalBid) {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Total bid can\'t be equal to the total number of cards',
        buttons: ['Close']
      });
      alert.present();
    } else {
      this.navCtrl.push('TrickPage', {
        round: this.roundIndex,
      });
    }
  }

  deletePlayer(player: string) {
    const alert = this.alertCtrl.create({
      title: `Delete player ${player}?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: data => {
            this.roundsProvider.deletePlayer(player, this.rounds, this.roundIndex);
            this.getRounds();
          }
        }
      ]
    });
    alert.present();
  }

  restart() {
    this.roundsProvider.restart(this.alertCtrl, this.navCtrl);
  }

}
