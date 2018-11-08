# Oh Hell Score [![Build Status](https://travis-ci.org/bdhoine/oh-hell-score.svg?branch=master)](https://travis-ci.org/bdhoine/oh-hell-score) [![codebeat badge](https://codebeat.co/badges/9419deef-029d-4491-b5b2-65e74a999a7f)](https://codebeat.co/projects/github-com-bdhoine-oh-hell-score-master)

## Build

```sh
brew install node gradle
brew cask install android-sdk
npm install -g ionic cordova
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