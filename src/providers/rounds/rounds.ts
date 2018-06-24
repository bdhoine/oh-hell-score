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

  nextPlayer(players:string[], dealer:string):string {
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

    orderedPlayers.forEach((player) => {
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
      this.storage.ready().then(() => {
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
    });
  }

  saveRounds(rounds:any) {
    this.storage.set('rounds', JSON.stringify(rounds));
  }

  getNextState(rounds:any, roundIndex:number, stateIndex:number) {
    if (roundIndex < rounds.length-1) {
      let round = rounds[roundIndex+1];
      if (stateIndex == 0) {
        return round.state[round.state.length-1];
      }
      return round.state[stateIndex-1];
    }
  }

  updateScore(rounds:any, roundIndex:number) {
    for(let stateIndex = 0; stateIndex < rounds[roundIndex].state.length; stateIndex++) {
      let state = rounds[roundIndex].state[stateIndex];
      let nextState = this.getNextState(rounds, roundIndex, stateIndex);
      if (state.bid == state.trick) {
        nextState.score = state.score + 10 + state.trick;
      }
      else {
        nextState.score = state.score - Math.abs(state.bid - state.trick);
      }
    }
    this.storage.set('rounds', JSON.stringify(rounds));
  }

  generateRounds(maxCards:number, players:string[], dealer:string):any {
    let rounds = [];
    for (let cards = 1; cards <= maxCards; cards++) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextPlayer(players, dealer);
    }
    for (let cards = maxCards; cards >= 1; cards--) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextPlayer(players, dealer);
    }
    this.storage.set('rounds', JSON.stringify(rounds));
  }

}
