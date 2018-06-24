import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { NgxErrorsModule } from '@ultimate/ngxerrors';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { NewGamePage } from '../pages/new-game/new-game';
import { BidPage } from '../pages/bid/bid';
import { TrickPage } from '../pages/trick/trick';
import { ScorePage } from '../pages/score/score';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';

import { PlayersProvider } from '../providers/players/players';
import { RoundsProvider } from '../providers/rounds/rounds';
import { SettingsProvider } from '../providers/settings/settings';
import { AuthService } from '../providers/authentication/auth.service';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { firebaseConfig } from '../config/firebase';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    NewGamePage,
    BidPage,
    TrickPage,
    ScorePage,
    LoginPage,
    SignupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    NgxErrorsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    NewGamePage,
    BidPage,
    TrickPage,
    ScorePage,
    LoginPage,
    SignupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PlayersProvider,
    RoundsProvider,
    SettingsProvider,
    AngularFireAuth,
    AuthService
  ]
})
export class AppModule {}
