import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class SettingsProvider {

  constructor(private storage: Storage) {
  }

  mergeSettings(settings:any, loaded:any):any {
    let mergedSettings = {};

    for(var key in settings) {
      mergedSettings[key] = settings[key];
    }

    for(let key in loaded) {
      mergedSettings[key] = loaded[key];
    }

    return mergedSettings;
  }

  loadSettings(settings:any) {
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
