import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { GameSettings } from '../../models/gamesettings.model';


@Injectable()
export class SettingsProvider {

  constructor(private storage: Storage) {
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

  loadSettings(settings: GameSettings): Promise<GameSettings> {
    return new Promise((resolve, reject) => {
      this.storage.get('settings').then((data) => {
        if (data != null) {
          resolve(this.mergeSettings(settings, JSON.parse(data)));
        }
        else {
          resolve(this.mergeSettings(settings, {}));
        }
      });
    });
  }

  saveSettings(settings:any) {
    this.storage.set('settings', JSON.stringify(settings));
  }

}
