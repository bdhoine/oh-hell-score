import type { ItemReorderEventDetail, SelectChangeEventDetail } from '@ionic/core';
import type { AlertInput } from '@ionic/react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonRippleEffect,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  NavContext,
  useIonAlert,
  useIonViewWillLeave
} from '@ionic/react';
import { trash } from 'ionicons/icons';
import { useCallback, useContext, useEffect, useState } from 'react';

import './NewGame.scss'
import { ReloadGameToast } from "../components/ReloadGameToast";
import { GameType } from '../models/GameType';
import { useGameState } from '../state/providers/AppStateProvider';
import storage from '../storage';

const NewGame: React.FC = () => {
  const { game, dispatch } = useGameState();
  const [newPlayer, setNewPlayer] = useState<string>();
  const [showRenameAlert] = useIonAlert();
  const [showPickDealerAlert] = useIonAlert();

  const players: string[] = game.playerState.players;
  const { navigate } = useContext(NavContext)


  useIonViewWillLeave(() => {
    storage.set('gameState', game);
  }, [game]);

  const updateMaxCardsToPlay = useCallback(() => {
    dispatch({
      type: 'UPDATE_MAX_CARDS',
      totalPlayers: game.playerState.players.length,
      gameType: game.settings.gameType
    })
  }, [dispatch, game.playerState.players.length, game.settings.gameType]);


  useEffect(() => {
    updateMaxCardsToPlay();
  }, [updateMaxCardsToPlay])

  const onEnter = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === "Enter") {
      saveNewPlayer();
    }
  }

  const saveNewPlayer = () => {
    if (newPlayer && newPlayer?.trim() !== "") {
      const playerName = newPlayer?.trim();
      dispatch({
        type: 'ADD_PLAYER',
        name: playerName
      })
      setNewPlayer('');
    }
  }

  const setMaxCards = (max: number) => {
    dispatch({
      type: 'SET_MAX_CARDS',
      maxCards: max,
    })
  }

  const updateGameType = (gameType: GameType) => {
    dispatch({
      type: 'UPDATE_GAME_TYPE',
      gameType,
    })
  }

  const deletePlayer = (name: string) => {
    dispatch({
      type: 'REMOVE_PLAYER',
      name,
    })
  }

  const doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
    const { from, to } = event.detail;

    dispatch({
      type: 'REORDER_PLAYER',
      from,
      to,
    })

    event.detail.complete();
  }

  const openRenameDialog = (player: string, position: number) => {
    showRenameAlert({
      header: `Rename ${player}`,
      message: 'Enter a new name below',
      backdropDismiss: true,
      keyboardClose: false,
      mode: "ios",

      inputs: [
        {
          name: 'name',
          type: 'text',
          id: 'rename-player',
          placeholder: 'Player name'
        }
      ],
      buttons: [
        'Cancel',
        {
          text: 'Rename', handler: (data) => {
            if (!data.name || !data.name.trim()) {
              return false;
            }
            dispatch({
              type: 'RENAME_PLAYER',
              location: position,
              name: data.name.trim(),
            })
          }
        },
      ],
      onDidPresent: (e) => {
        const alert = e.currentTarget as HTMLElement;
        if (alert) {
          const renameInput = alert.querySelector('#rename-player') as HTMLElement;
          if (renameInput) {
            renameInput.focus();
          }
        }
      }
    })
  }


  const startGame = (dealer: string) => {
    const settings = game.settings;
    dispatch({
      type: 'GENERATE_ROUNDS',
      dealer,
      players,
      settings,
    })
    dispatch({
      type: 'SET_ROUND',
      round: 0
    })
    navigate(`/bid`);
  }

  const generatePlayerRadios = (): AlertInput[] => {
    return game.playerState.players.map(player => {
      return {
        name: 'dealer',
        type: 'radio',
        label: player,
        value: player,
      }
    })
  }

  const showDealerPicker = () => {
    saveNewPlayer();

    showPickDealerAlert({
      header: 'Pick Dealer',
      backdropDismiss: true,
      keyboardClose: false,
      inputs: generatePlayerRadios(),
      buttons: [
        'Cancel',
        {
          text: 'Pick dealer', handler: (dealer: string) => {
            if (dealer) {
              startGame(dealer)
              return true;
            }
            return false;
          }
        },
      ]
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>New Game</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList className="oh-hell__players">
          <IonListHeader>Players</IonListHeader>
          <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
            {players.map((player, position) => {
              return (
                <IonItemSliding key={player}>
                  <IonItem onClick={() => openRenameDialog(player, position)}>
                    <IonLabel>{player}</IonLabel>
                    <IonReorder slot="end" />
                  </IonItem>
                  <IonItemOptions side="start" onIonSwipe={() => deletePlayer(player)}>
                    <IonItemOption color="danger" onClick={() => deletePlayer(player)}>
                      <IonIcon icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              )
            })}
          </IonReorderGroup>
          <IonItem>
            <IonInput
              value={newPlayer}
              placeholder="New player..."
              onIonChange={(e) => e.detail.value != null && setNewPlayer(e.detail.value)}
              onKeyDown={e => onEnter(e)}
              onBlur={() => saveNewPlayer()}
              autocapitalize="on"
              autofocus
              clearInput
            >
            </IonInput>
          </IonItem>
        </IonList>
        <IonList class="outer-content">
          <IonListHeader>Configuration</IonListHeader>
          <IonItem>
            <IonLabel>Maximum Cards</IonLabel>
            <IonSelect value={game.settings.maxCards}
              onIonChange={(e: CustomEvent<SelectChangeEventDetail>) => setMaxCards(e.detail.value)}>
              {game.settings.possibleCardsToPlay.map((num: number) => <IonSelectOption key={num}
                value={num}>{num}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Cards to play</IonLabel>
            <IonSelect value={game.settings.gameType}
              onIonChange={(e: CustomEvent<SelectChangeEventDetail>) => updateGameType(e.detail.value)}>
              <IonSelectOption value={GameType.ALL}>All</IonSelectOption>
              <IonSelectOption value={GameType.EVEN}>Even</IonSelectOption>
              <IonSelectOption value={GameType.ODD}>Odd</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Bonus</IonLabel>
            <IonInput
              type="number"
              value={game.settings.bonus}
              onIonChange={(e) => {
                const value = Number(e.detail.value);
                if (!isNaN(value)) {
                  dispatch({ type: 'SET_BONUS', bonus: value });
                }
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel>Penalty per trick</IonLabel>
            <IonInput
              type="number"
              value={game.settings.penaltyPerTrick}
              onIonChange={(e) => {
                const value = Number(e.detail.value);
                if (!isNaN(value)) {
                  dispatch({ type: 'SET_PENALTY_PER_TRICK', penaltyPerTrick: value });
                }
              }}
            />
          </IonItem>
        </IonList>
        <IonButton className="oh-hell__start-button" expand="block" onClick={() => showDealerPicker()}>
          Start Game
          <IonRippleEffect type="unbounded" />
        </IonButton>
        <ReloadGameToast loadedGame={game} allowedRoute={'/newgame'} />
      </IonContent>
    </IonPage>
  );
};

export default NewGame;
