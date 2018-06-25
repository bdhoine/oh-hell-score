# Oh Hell Score [![Build Status](https://travis-ci.org/bdhoine/oh-hell-score.svg?branch=master)](https://travis-ci.org/bdhoine/oh-hell-score)

## Build

```sh
brew install node
brew cask install android-platform-tools android-sdk gradle
npm install -g ionic codova
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