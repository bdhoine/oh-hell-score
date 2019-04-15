import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';

import { PlayersProvider } from '../../providers/players/players';
import { SettingsProvider } from '../../providers/settings/settings';
import { RoundsProvider } from '../../providers/rounds/rounds';
import { isOdd } from '../../utils/number-utils';
import { GameSettings } from '../../models/gamesettings';
import { GameType } from '../../models/gametype';

@IonicPage()
@Component({
  selector: 'page-new-game',
  templateUrl: 'new-game.html'
})
export class NewGamePage {

  players: any;
  newPlayer: string;
  settings: GameSettings;
  cards: number[];

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public playersProvider: PlayersProvider,
    public settingsProvider: SettingsProvider,
    public roundsProvider: RoundsProvider
  ) {
    this.cards = Array(16).fill(0).map((x, i) => i + 2);
    this.newPlayer = '';
    this.players = [];
    this.settings = {
      maxCards: 7,
      cardsToPlay: GameType.ALL
    };
  }

  ionViewWillEnter() {
    this.playersProvider.loadPlayers().then((players) => {
      this.players = players;
    });
    this.settingsProvider.loadSettings(this.settings).then((settings: GameSettings) => {
      this.settings = settings;
    });
  }

  ionViewWillLeave() {
    this.playersProvider.savePlayers(this.players);
    this.settingsProvider.saveSettings(this.settings);
  }

  addPlayer() {
    if (this.newPlayer.length > 0) {
      this.players.push(this.newPlayer);
      this.newPlayer = '';
    }
    this.updateCardsSelect();
  }

  get numberOfPlayers() {
    return this.players.length;
  }

  generateCards(amount: number): number[] {
    return Array(amount - 1).fill(0).map((x, i) => i + 2)
  }

  private isValidCardsAmount(amountOfCards: number) {
    return (this.settings.cardsToPlay === GameType.ODD && isOdd(amountOfCards))
      || (this.settings.cardsToPlay === GameType.EVEN && !isOdd(amountOfCards) || this.settings.cardsToPlay === GameType.ALL)
  }

  private roundCardsToPlay(maxCards: number) {
    if (!this.isValidCardsAmount(maxCards)) {
      maxCards--;
    }
    return maxCards;
  }

  updateCardsSelect() {
    let maxCards = this.numberOfPlayers > 0 ? Math.floor(52 / this.numberOfPlayers) : 52;
    maxCards = this.roundCardsToPlay(maxCards);

    if (this.settings.cardsToPlay === GameType.ODD) {
      this.cards = this.generateCards(maxCards).filter((num) => isOdd(num))
    } else if (this.settings.cardsToPlay === "even") {
      this.cards = this.generateCards(maxCards - 1).filter((num) => !isOdd(num))
    } else {
      this.cards = Array(maxCards).fill(0).map((x, i) => i + 1);
    }
    this.settings.maxCards = this.getClosestMaxCards();
  }

  get lastRoundAmount(): number {
    return this.cards[this.cards.length - 1]
  }

  private getClosestMaxCards() {
    let closest = this.settings.maxCards;
    if (closest > this.lastRoundAmount) {
      closest = this.lastRoundAmount;
    } else if (!this.isValidCardsAmount(this.settings.maxCards)) {
      if (this.settings.maxCards + 1 <= this.lastRoundAmount) {
        closest++;
      } else {
        closest--;
      }
    }
    return closest;
  }

  renamePlayer(player: string, index: number) {
    let prompt = this.alertCtrl.create({
      message: 'Enter new name for player: <b>' + player + '</b>',
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
    this.updateCardsSelect();
  }

  deletePlayers() {
    this.players = [];
    this.updateCardsSelect();
  }

  deletePlayersConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Clear player list',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: data => {
            this.deletePlayers();
          }
        }
      ]
    });

    alert.present();
  }

  reorderPlayers(event) {
    let player = this.players[event.from];
    this.players.splice(event.from, 1);
    this.players.splice(event.to, 0, player);
  }

  setDealer() {
    let alert = this.alertCtrl.create({
      title: 'Set dealer',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Start',
          handler: dealer => {
            if (typeof dealer != 'undefined') {
              this.roundsProvider.generateRounds(this.settings, this.players, dealer);
              this.navCtrl.push('BidPage', {
                round: 0
              });
            }
          }
        }
      ]
    });

    this.players.forEach((player) => {
      alert.addInput({
        type: 'radio',
        label: player,
        value: player
      });
    });

    alert.present();
  }

  startGame() {
    this.setDealer();
  }

}
