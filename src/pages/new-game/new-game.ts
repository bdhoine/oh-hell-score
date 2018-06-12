import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-new-game',
  templateUrl: 'new-game.html'
})
export class NewGamePage {

  players:string[];
  newPlayer:string = '';
  maxRounds:number = 7;
  rounds:number[];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, private storage: Storage) {
    this.rounds = Array(17).fill(1).map((x,i) => i+1);
    this.loadPlayers();
  }

  loadPlayers() {
    this.storage.get('players').then((val) => {
      if (val !== null) {
        this.players = JSON.parse(val);
      }
      else {
        this.players = [];
      }
    });
  }

  savePlayers() {
    this.storage.set('players', JSON.stringify(this.players));
  }

  renamePlayer(item) {
    const prompt = this.alertCtrl.create({
      message: "Enter new name for player: <b>" + item + "</b>",
      inputs: [
        {
          name: 'name',
          placeholder: 'New name..'
        },
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
            this.savePlayers();
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
    this.savePlayers();
  }

  reorderPlayers(event) {
    let player = this.players[event.from];
    this.players.splice(event.from, 1);
    this.players.splice(event.to, 0, player);
    this.savePlayers();
  }

  addPlayer() {
    if (this.newPlayer.length > 0) {
      this.players.push(this.newPlayer);
      this.newPlayer = '';
      this.savePlayers();
    }
  }

  startGame() {
    console.log(this.maxRounds);
    console.log(this.players);
  }

}
