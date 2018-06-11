import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-new-game',
  templateUrl: 'new-game.html'
})
export class NewGamePage {

  players:string[];
  newPlayer:string;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, private storage: Storage) {
    this.players = ['Barry', 'Roy', 'Nik'];
    this.newPlayer = '';
    // this.savePlayers();
    this.loadPlayers();
  }

  loadPlayers() {
    this.storage.get('players').then((val) => {
      console.log('Player is', val);
    });
  }

  savePlayers() {
    this.storage.set('players', 'Maxim');
  }

  renamePlayer(item) {
    console.debug('renamePlayer(): ' + item);

    const prompt = this.alertCtrl.create({
      message: "Enter new name for player: " + item,
      inputs: [
        {
          name: 'name',
          placeholder: 'New name..'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.debug('Cancel clicked');
          }
        },
        {
          text: 'Rename',
          handler: data => {
            console.debug('Rename clicked');
            console.debug(data.name);
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
    console.debug('deletePlayer(): ' + item);
    var index = this.players.indexOf(item, 0);
    if (index > -1) {
      this.players.splice(index, 1);
    }
  }

  reorderPlayers(event) {
    console.debug('reorderPlayers():')
    console.debug(event);
    let player = this.players[event.from];
    this.players.splice(event.from, 1);
    this.players.splice(event.to, 0, player);
  }

  addPlayer() {
    console.debug('addPlayer(): ' + this.newPlayer);
    if (this.newPlayer.length > 0) {
      this.players.push(this.newPlayer);
      this.newPlayer = '';
    }
  }

  startGame() {
    console.debug('startGame()');
  }

}
