import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()
export class RoundsProvider {

  constructor(private storage: Storage) {
  }

  getRound(index:number):any {
    return new Promise((resolve, reject) => {
      this.storage.get('rounds').then((data) => {
        if (data != null) {
          let rounds = JSON.parse(data);
          resolve(rounds[index]);
        }
        else {
          reject();
        }
      });
    });
  }

  generateRounds(maxCards:number, players:string[]):any {
    let rounds = [];
    for (let x = 0; x < maxCards; x++) {
      rounds.push({
        cards: x+1,
        bids: Array(players.length).fill(0),
        tricks: Array(players.length).fill(0),
      });
    }
    for (let x = 0; x < maxCards; x++) {
      rounds.push({
        cards: maxCards-x,
        bids: Array(players.length).fill(0),
        tricks: Array(players.length).fill(0),
      });
    }
    this.storage.set('rounds', JSON.stringify(rounds));
  }

}
