import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { NewGamePage } from '../pages/new-game/new-game';
import { RoundPage } from '../pages/round/round';

import { PlayersProvider } from '../providers/players/players';
import { RoundsProvider } from '../providers/rounds/rounds';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    NewGamePage,
    RoundPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    NewGamePage,
    RoundPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PlayersProvider,
    RoundsProvider
  ]
})
export class AppModule {}
