import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class RoundsProvider {

  constructor(private storage: Storage) {
  }

  orderPlayers(players:string[], dealer:string) {
    let index = players.indexOf(dealer);
    if (index == players.length-1) {
      return players;
    }
    let orderedPlayers = players.slice(index+1);
    return orderedPlayers.concat(players.slice(0, index+1));
  }

  nextDealer(players:string[], dealer:string):string {
    let index = players.indexOf(dealer);
    if (index+1 == players.length) {
      return players[0];
    }
    return players[index+1];
  }

  generateRound(cards:number, players:string[], dealer:string):any {
    let round = {
      cards: cards,
      state: []
    }

    let orderedPlayers = this.orderPlayers(players, dealer);

    orderedPlayers.forEach(function(player) {
      round.state.push({
        player: player,
        bid: 0,
        trick: 0,
        score: 0
      });
    });

    return round;
  }

  getRounds():any {
    return new Promise((resolve, reject) => {
      this.storage.get('rounds').then((data) => {
        if (data != null) {
          let rounds = JSON.parse(data);
          resolve(rounds);
        }
        else {
          reject();
        }
      });
    });
  }

  saveRounds(rounds:any) {
    this.storage.set('rounds', JSON.stringify(rounds));
  }

  updateScore(rounds:any, roundIndex:number) {
    for(let index = 1; index <= roundIndex; index++) {
      for(let stateIndex = 0; stateIndex < rounds[index].state.length; stateIndex++) {
        let state = rounds[index].state[stateIndex];
        let previousState = rounds[index-1].state[stateIndex];
        if (previousState.bid == previousState.trick) {
          state.score = previousState.score + 10 + previousState.trick;
        }
        else {
          state.score = previousState.score - Math.abs(previousState.bid - previousState.trick);
        }
      }
    }
    this.storage.set('rounds', JSON.stringify(rounds));
  }

  generateRounds(maxCards:number, players:string[], dealer:string):any {
    let rounds = [];
    for (let cards = 1; cards <= maxCards; cards++) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextDealer(players, dealer);
    }
    for (let cards = maxCards; cards >= 1; cards--) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextDealer(players, dealer);
    }
    this.storage.set('rounds', JSON.stringify(rounds));
  }

}
