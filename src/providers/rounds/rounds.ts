import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController, NavController } from 'ionic-angular';
import { GameType } from './../../models/gametype.model';

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

  deletePlayer(player: string, oldRounds, currentRound: number) {
    const newRounds = [];

    oldRounds.forEach((round, index) => {
      if (index < currentRound) {
        newRounds.push(round);
      } else {
        const newState = [...round.state];
        const index = round.state.findIndex((playerConfig => playerConfig.player === player));
        newState.splice(index, 1);

        newRounds.push({
          cards: round.cards,
          state: newState
        })
      }
    });
    this.storage.set('rounds', JSON.stringify(newRounds));
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

  determineRoundConfig(settings: any): any {
    let config = {
      start: 1,
      step: 1,
      maxCards: Number(settings.maxCards)
    }

    if (settings.cardsToPlay == "even") {
      config.start = 2;
    }
    if (settings.cardsToPlay !== "all") {
      config.step = 2;
    }
    if ((config.maxCards % 2 == 0 && settings.cardsToPlay == GameType.ODD) ||
        (config.maxCards % 2 != 0 && settings.cardsToPlay == GameType.EVEN)) {
          config.maxCards -= 1;
    }

    return config
  }

  generateRounds(settings:any, players:string[], dealer:string):any {
    let rounds = [];
    let config = this.determineRoundConfig(settings);

    for (let cards = config.start; cards <= config.maxCards; cards += config.step) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextPlayer(players, dealer);
    }
    for (let cards = config.maxCards; cards >= 1; cards -= config.step) {
      rounds.push(this.generateRound(cards, players, dealer));
      dealer = this.nextPlayer(players, dealer);
    }

    this.storage.set('rounds', JSON.stringify(rounds));
  }

  restart(alertCtrl:AlertController, navCtrl: NavController) {
    let alert = alertCtrl.create({
      title: 'Restart game?',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: data => {
            navCtrl.goToRoot({});
          }
        }
      ]
    });

    alert.present();
  }

}
