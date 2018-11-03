import { SettingsComponent } from './../../components/settings/settings';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';

@IonicPage()
@Component({
  selector: 'page-bid',
  templateUrl: 'bid.html',
})
export class BidPage {

  roundIndex:number;
  totalBid:number;

  constructor(
      public navParams: NavParams,
      public navCtrl: NavController,
      public alertCtrl: AlertController,
      public playersProvider: PlayersProvider,
      public roundsProvider: RoundsProvider,
      public popoverController: PopoverController
  ) {
    this.roundIndex = this.navParams.get('round');
    this.totalBid = 0;
  }

  get bidNotAllowed() {
    return this.round.cards - this.totalBid;
  }


  ionViewWillEnter() {
  }

  get round() {
    return this.roundsProvider.rounds[this.roundIndex];
  }

  ionViewWillLeave() {
    this.roundsProvider.storeRounds(this.roundsProvider.rounds);
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

  calculateTotalBid():number {
    let total = 0;
    if (this.round) {
      this.round.state.forEach((state) => {
        total += state.bid;
      });
    }
    return total;  
  }

  isLastPlayer(player:string) {
    return this.round.state[this.round.state.length-1].player == player;
  }

  setBid(state) {
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
            this.totalBid = this.calculateTotalBid();
          }
        }
      ]
    });

    for (var x = 0; x <= this.round.cards; x++) {
      if ((!this.isLastPlayer(state.player)) || (this.round.cards != this.totalBid + x)) {
        alert.addInput({
          type: 'radio',
          label: x.toString(),
          value: x.toString()
        });
      }
    }

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
    }
    else {
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
            this.roundsProvider.deletePlayer(player, this.roundsProvider.rounds, this.roundIndex);
          }
        }
      ]
    });
    alert.present();
  }

  showSettings(event) {
    let popover = this.popoverController.create(SettingsComponent, {
      round: this.round,
      roundIndex: this.roundIndex,
    });
    popover.present({
      ev: event
    });
  }

}
