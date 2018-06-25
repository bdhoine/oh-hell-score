# Oh Hell Score

## Build

```sh
brew cask install node android-platform-tools android-sdk gradle
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