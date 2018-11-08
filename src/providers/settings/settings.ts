import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { GameSettings } from '../../models/gamesettings';

@Injectable()
export class SettingsProvider {

  constructor(private storage: Storage) {
  }

  mergeSettings(settings: GameSettings, data: any): GameSettings {
    let mergedSettings = {};
    let loadedSettings = {};

    if (data != null) {
      loadedSettings = JSON.parse(data);
    }

    for(var key in settings) {
      mergedSettings[key] = settings[key];
    }
    for(let key in loadedSettings) {
      mergedSettings[key] = loadedSettings[key];
    }

    return mergedSettings as GameSettings;
  }

  loadSettings(settings: GameSettings): Promise<GameSettings> {
    return new Promise((resolve, reject) => {
      this.storage.get('settings').then((data) => {
        resolve(this.mergeSettings(settings, data));
      });
    });
  }

  saveSettings(settings: any) {
    this.storage.set('settings', JSON.stringify(settings));
  }

}
