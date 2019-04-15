import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class PlayersProvider {

  constructor(private storage: Storage) {
  }

  loadPlayers() {
    return new Promise((resolve, reject) => {
      this.storage.ready().then(() => {
        this.storage.get('players').then((data) => {
          if (data != null) {
            resolve(JSON.parse(data));
          } else {
            resolve([]);
          }
        });
      });
    });
  }

  savePlayers(players: string[]) {
    this.storage.set('players', JSON.stringify(players));
  }

}
