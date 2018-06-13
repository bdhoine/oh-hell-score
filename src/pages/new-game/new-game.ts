import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { RoundPage } from '../round/round';

import { PlayersProvider } from '../../providers/players/players';


@Component({
  selector: 'page-new-game',
  templateUrl: 'new-game.html'
})
export class NewGamePage {

  players:any = [];
  newPlayer:string = '';
  maxCards:number = 7;
  rounds:number[];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public playersProvider: PlayersProvider) {
    this.rounds = Array(17).fill(1).map((x,i) => i+1);
    this.playersProvider.loadPlayers().then((data) => {
      this.players = data;
    });
  }

  ionViewWillLeave() {
    this.playersProvider.savePlayers(this.players);
  }

  setDealer() {
    let alert = this.alertCtrl.create({
      title: "Set dealer",
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Start',
          handler: data => {
            console.log(data);
            this.navCtrl.push(RoundPage);
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

  renamePlayer(item) {
    let prompt = this.alertCtrl.create({
      message: "Enter new name for player: <b>" + item + "</b>",
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

  addPlayer() {
    if (this.newPlayer.length > 0) {
      this.players.push(this.newPlayer);
      this.newPlayer = '';
    }
  }

  startGame() {
    this.playersProvider.savePlayers(this.players);
    this.setDealer();
    console.log(this.maxCards);
    console.log(this.players);
  }

}
