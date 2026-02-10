# CLAUDE.md

## Project Overview

Oh Hell Score is a mobile-first PWA for keeping score in the card game Oh Hell. Built with React, TypeScript, and Ionic Framework.

## Commands

- `npm start` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Jest tests

## Architecture

### State Management

Uses React Context with combined reducers (`react-combine-reducers`):

- `playerReducer` — Add, remove, rename, reorder players
- `roundReducer` — Round generation, bids, tricks, scores, penalties
- `settingsReducer` — Game type, max cards, bonus/penalty config

State is auto-saved to Ionic Storage on page navigation and can be restored.

### Routing

Hash-based routing (`/#/newgame`, `/#/bid`, `/#/trick`, `/#/score`).

Game flow: NewGame → Bid → Trick → (repeat rounds) → Score

### Key Files

- `src/pages/NewGame.tsx` — Game setup (players, settings, dealer pick)
- `src/pages/Bid.tsx` — Bidding phase per round
- `src/pages/Trick.tsx` — Trick tracking per round
- `src/pages/Score.tsx` — Final leaderboard
- `src/state/reducers/` — All state mutation logic
- `src/@types/state.d.ts` — Type definitions for state and actions

### Patterns

- Ionic sliding items (`IonItemSliding`) for swipe-to-delete and swipe-to-penalise
- `useIonAlert` for modal dialogs (bid picker, trick picker, rename)
- Actions are dispatched through a single `dispatch` from `useGameState()` hook
- All action types are defined in `src/@types/state.d.ts` as `GameAction`
