import type {AlertInput} from '@ionic/react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  NavContext,
  useIonAlert,
  useIonViewWillLeave
} from '@ionic/react';
import {arrowForwardOutline, chevronBack, handLeft, trash} from 'ionicons/icons';
import {useContext} from "react";

import type {PlayerBet, Round} from '../@types/state';
import {RestartButton} from "../components/RestartButton";
import {useGameState} from '../state/providers/AppStateProvider';
import './BidTrick.scss';
import storage from "../storage";
import {calculatePlayerScore} from '../util/round.util';

const TrickPage: React.FC = () => {
  const {game, dispatch} = useGameState();
  const round: Round = game.roundState.rounds[game.roundState.activeRound];
  const [showTrickAlert, dismissTrickAlert] = useIonAlert();
  const {navigate, goBack} = useContext(NavContext)

  const generateAlertInput = (name: string, trick: number, currentTrick: number, player: string): AlertInput => {
    return {
      name: name,
      type: 'radio',
      checked: trick === currentTrick,
      label: String(trick),
      value: trick,
      handler: (e) => {
        dispatch({
          type: 'SET_TRICK',
          player,
          amount: e.value
        })
        dismissTrickAlert();
      }
    }
  }

  const generateInputs = (player: string, cardsInRound: number, currentBid: number): AlertInput[] => {
    const inputs: AlertInput[] = [];
    Array(cardsInRound + 1)
      .fill(0)
      .forEach((_, i) => {
        inputs.push(generateAlertInput('trick', i, currentBid, player));
      });
    return inputs;
  };

  const getTotalTrick = () => {
    return round.playerBets.reduce((accumulator, current: PlayerBet) => {
      return accumulator + current.trick
    }, 0);
  }

  const showTrickDialog = (player: string, cards: number, currentBid: number) => {
    showTrickAlert({
      header: `Trick for ${player}`,
      backdropDismiss: true,
      keyboardClose: false,
      mode: "ios",
      inputs: generateInputs(player, cards, currentBid),
    })
  }

  const nextRound = () => {
    const activeRound = game.roundState.activeRound;
    if (activeRound + 1 === game.roundState.rounds.length) {
      dispatch({
        type: 'CALCULATE_ROUND_SCORE',
      })
      navigate('/score')
    } else {
      navigate('/bid');
      dispatch({
        type: 'NEXT_ROUND',
      })
    }
  }

  useIonViewWillLeave(() => {
    storage.set('gameState', game);
  }, [game]);

  return round ? (
    <IonPage className="oh-hell">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => goBack()}>
              <IonIcon icon={chevronBack}/>
              Back
            </IonButton>
          </IonButtons>
          <IonTitle>Trick {round.cards}</IonTitle>
          <IonButtons slot="end">
            <RestartButton/>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="oh-hell__round">
          <IonItemGroup>
            <IonItem color="primary">
              <IonGrid>
                <IonRow>
                  <IonCol size="6">Player</IonCol>
                  <IonCol className="col-center" size="2">Bid</IonCol>
                  <IonCol className="col-center" size="2">Trick</IonCol>
                  <IonCol className="col-center" size="2">Score</IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>
          </IonItemGroup>
          <IonItemGroup>
            {round.playerBets.map((bet, i) => {
              return (
                <IonItemSliding key={i}>
                  <IonItem color={i % 2 === 1 ? "light" : ""}>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="6" className="oh-hell__player">
                          <div>
                            {bet.player === round.dealer ?
                              <IonIcon icon={handLeft}/> : null}
                            <IonText>{bet.player}</IonText>
                          </div>
                        </IonCol>
                        <IonCol className="col-center" size="2">
                          <IonText color="medium">{bet.bid}</IonText>
                        </IonCol>
                        <IonCol className="col-center" size="2">
                          <IonText
                            onClick={() => showTrickDialog(bet.player, round.cards, bet.trick)}>{bet.trick}</IonText>
                        </IonCol>
                        <IonCol className="col-center" size="2">
                          <IonBadge text-center
                                    color="light">{calculatePlayerScore(game.roundState.rounds, bet.player, game.roundState.activeRound - 1)}</IonBadge>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonItem>
                  <IonItemOptions side="start">
                    <IonItemOption color="danger">
                      <IonIcon icon={trash}/>
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonItemGroup>
          <IonItemGroup>
            <IonItem>
              <IonGrid>
                <IonRow>
                  <IonCol size="6"/>
                  <IonCol className="col-center" size="2"/>
                  <IonCol className="col-center" size="2">
                    <IonBadge
                      color={getTotalTrick() === round.cards ? "success" : "danger"}>{getTotalTrick()}</IonBadge>
                  </IonCol>
                  <IonCol className="col-center" size="2"/>
                </IonRow>
              </IonGrid>
            </IonItem>
          </IonItemGroup>
        </IonList>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton disabled={getTotalTrick() !== round.cards} mode="ios" className="floating-button"
                        onClick={() => nextRound()}>
            <IonIcon icon={arrowForwardOutline}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  ) : null;
};

export default TrickPage;
