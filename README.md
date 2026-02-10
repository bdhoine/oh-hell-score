# Oh Hell Score keeper

[![Netlify Status](https://api.netlify.com/api/v1/badges/0354d369-5f59-4b62-9140-df4accf170e6/deploy-status)](https://app.netlify.com/sites/oh-hell-score/deploys)

https://oh-hell-score.byteshark.be

A mobile-friendly score keeper for the card game Oh Hell. Built as a PWA so it works offline on any device.

## Features

- Add, remove, rename and reorder players
- Configurable game types: All, Odd or Even rounds
- Configurable bonus and penalty scoring
- Bid and trick tracking per round with validation
- Running score display and final leaderboard
- Swipe gestures to delete or penalise players mid-game
- Auto-saves game state so you can resume interrupted games
- Works offline (PWA with service worker)

## Tech Stack

- React 17 + TypeScript
- Ionic Framework 5 (mobile UI)
- Capacitor 3 (native features: haptics, status bar)
- React Context + combined reducers for state management
- Ionic Storage for persistence

## Getting Started

```bash
npm install
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
