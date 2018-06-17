import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { RoundsProvider } from '../../providers/rounds/rounds';


@Component({
  selector: 'page-round',
  templateUrl: 'round.html',
})
export class RoundPage {

  players:any;
  round:any = {
    cards: 0
  };
  roundEntries:any = [];
  roundId:number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public playersProvider: PlayersProvider, public roundsProvider: RoundsProvider) {
    this.roundId = navParams.get('round');
    this.playersProvider.loadPlayers().then((data) => {
      this.players = data;
      if (this.roundId == 0) {
        this.roundsProvider.generateRounds(navParams.get('maxCards'), this.players);
      }
      this.round = this.roundsProvider.getRound(this.roundId).then((data) => {
        this.round = data;
      });
      this.reorderPlayers(navParams.get('dealer'));
    });
  }

  reorderPlayers(dealer) {
    let index = this.players.indexOf(dealer, 0);
    let players = this.players.slice(index);
    players = players.concat(this.players.slice(0, index));
    players.forEach(function(player) {
      this.roundEntries.push({
        player: player,
        bid: 0,
        trick: 0,
        score: 0
      });
    }, this);
  }

  isLastPlayer(player):boolean {
    return player == this.roundEntries[this.roundEntries.length-1].player;
  }

  totalBid():number {
    let totalBid = 0;
    this.roundEntries.forEach(function(entry) {
      totalBid += entry.bid;
    })
    return totalBid;
  }

  totalTrick():number {
    let totalTrick = 0;
    this.roundEntries.forEach(function(entry) {
      totalTrick += entry.trick;
    })
    return totalTrick;
  }


  setBid(roundEntry) {
    let alert = this.alertCtrl.create({
      title: "Set bid",
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            roundEntry.bid = Number(data);
          }
        }
      ]
    });

    for (var x = 0; x <= this.round.cards; x++) {
      if (!this.isLastPlayer(roundEntry.player) || (this.round.cards != this.totalBid() + x)) {
        alert.addInput({
          type: 'radio',
          label: x.toString(),
          value: x.toString()
        });
      }
    }

    alert.present();
  }

  setTrick(roundEntry) {
    let alert = this.alertCtrl.create({
      title: "Set trick",
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            roundEntry.trick = Number(data);
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

  nextRound() {
    if (this.round.cards == this.totalTrick()) {
      this.navCtrl.push(RoundPage, {
        round: this.roundId+1,
        dealer: this.roundEntries[1].player
      });
    }
    else {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Total tricks is ' + this.totalTrick() + ' but it should be ' + this.round.cards,
        buttons: ['OK']
      });
      alert.present();
    }
  }

}
