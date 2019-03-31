# Oh Hell Score [![Build Status](https://travis-ci.org/bdhoine/oh-hell-score.svg?branch=master)](https://travis-ci.org/bdhoine/oh-hell-score)

## Build

```sh
brew install node gradle
brew cask install android-sdk
npm install -g cordova@8.1.2 ionic@4.12.0
sdkmanager 'build-tools;28.0.0'
```

## Run

### Browser

```sh
ionic serve
```

### Android

```sh
ionic cordova platform add android
ionic cordova run android --prod --release
```

### iOS

```sh
ionic cordova platform add ios
ionic cordova run ios --prod --release
```
