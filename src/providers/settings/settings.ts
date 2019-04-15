import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { GameSettings } from '../../models/gamesettings';
import { GameType } from '../../models/gametype';
import { isOdd } from '../../utils/number-utils';

@Injectable()
export class SettingsProvider {

  public settings: GameSettings;

  constructor(private storage: Storage) {
    this.settings = {
      maxCards: 7,
      cardsToPlay: GameType.ALL
    }
  }

  public getCardsToPlay(players: number, roundCards?: number): number[] {
    let cards = [];
    let maxCards = players > 0 ? Math.floor(52 / players) : 52;
    maxCards = this.roundCardsToPlay(maxCards);

    if (this.settings.cardsToPlay === GameType.ODD) {
      cards = this.generateCards(maxCards).filter((num) => isOdd(num))
    } else if (this.settings.cardsToPlay === "even") {
      cards = this.generateCards(maxCards - 1).filter((num) => !isOdd(num))
    } else {
      cards = Array(maxCards - 1).fill(0).map((x, i) => i + 2);
    }

    if (roundCards > 0) {
      cards = cards.filter((cards: number) => cards >= roundCards); 
    }

    return cards;
  }

  generateCards(amount: number): number[] {
    return Array(amount - 1).fill(0).map((x, i) => i + 2)
  }

  private roundCardsToPlay(maxCards: number) {
    if (!this.isValidCardsAmount(this.settings)) {
      maxCards--;
    }
    return maxCards;
  }

  public isValidCardsAmount(settings: GameSettings) {
    return (settings.cardsToPlay === GameType.ODD && isOdd(settings.maxCards))
      || (settings.cardsToPlay === GameType.EVEN && !isOdd(settings.maxCards) || settings.cardsToPlay === GameType.ALL)
  }

  mergeSettings(settings: GameSettings, loaded: any): GameSettings {
    let mergedSettings = {};

    for(var key in settings) {
      mergedSettings[key] = settings[key];
    }

    for(let key in loaded) {
      mergedSettings[key] = loaded[key];
    }
    return mergedSettings as GameSettings;
  }

  getStoredSettings = async (): Promise<GameSettings> => {
    return this.storage.get('settings').then((settings: string) => {
      return JSON.parse(settings) as GameSettings
    });
  }

  loadSettings(settings: GameSettings): Promise<GameSettings> {
    return new Promise((resolve, reject) => {
      this.getStoredSettings().then((data: GameSettings) => {
        if (data != null) {
          resolve(this.mergeSettings(settings, data));
        }
        else {
          resolve(this.mergeSettings(settings, {}));
        }
      });
    });
  }

  saveSettings(settings:any) {
    this.settings = settings;
    this.storage.set('settings', JSON.stringify(settings));
  }

}
