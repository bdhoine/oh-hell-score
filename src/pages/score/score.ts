import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { RoundsProvider } from '../../providers/rounds/rounds';


@IonicPage()
@Component({
  selector: 'page-score',
  templateUrl: 'score.html',
})
export class ScorePage {

  scores:any;

  constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      public roundsProvider: RoundsProvider
  ) {
    this.scores = [];
  }
  ionViewWillEnter() {
      const rounds = this.roundsProvider.rounds;
      this.buildScoreArray(rounds[rounds.length-1].state);
      this.orderScores();
  }

  buildScoreArray(round:any) {
    round.forEach((element) => {
      let score = element.score;
      if (element.bid == element.trick) {
        score += 10 + element.trick;
      }
      else {
        score -= Math.abs(element.bid - element.trick);
      }
      this.scores.push({
        player: element.player,
        score: score,
      })
    });
  }

  orderScores() {
    this.scores = this.scores.sort(function(a, b) {
      let x = a.score;
      let y = b.score;
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
  }

  newGame() {
    this.navCtrl.push('NewGamePage');
  }

}
