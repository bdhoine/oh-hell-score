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
import {arrowForwardOutline, chevronBack, handLeft, remove, trash} from 'ionicons/icons';
import {useContext} from 'react';

import type {PlayerBet, Round} from '../@types/state';
import { PenaltyItemOption } from '../components/PenalytButton';
import {RestartButton} from "../components/RestartButton";
import {useGameState} from '../state/providers/AppStateProvider';
import storage from '../storage';
import {calculatePlayerScore} from '../util/round.util';

import './BidTrick.scss';

const BidPage: React.FC = () => {
  const {game, dispatch} = useGameState();
  const round: Round = game.roundState.rounds[game.roundState.activeRound];
  const [showBidAlert, dismissBidAlert] = useIonAlert();
  const {navigate} = useContext(NavContext)

  const getTotalBid = () => {
    return round.playerBets.reduce((accumulator, current: PlayerBet) => {
      return accumulator + current.bid
    }, 0);
  }

  const getBidNotOkay = () => {
    return round.cards - getTotalBid();
  }

  useIonViewWillLeave(() => {
    storage.set('gameState', game);
  }, [game]);

  const generateBidInput = (name: string, bid: number, currentBid: number, player: string): AlertInput => {
    return {
      name: name,
      type: 'radio',
      checked: bid === currentBid,
      label: String(bid),
      value: bid,
      handler: (e) => {
        dispatch({
          type: 'SET_BID',
          player,
          amount: e.value
        })
        dismissBidAlert();
      }
    }
  }

  const generateInputs = (player: string, cardsInRound: number, currentBid: number): AlertInput[] => {
    const inputs: AlertInput[] = [];
    Array(cardsInRound + 1)
      .fill(0)
      .forEach((_, i) => {
        if (player !== round.dealer || (player === round.dealer && getBidNotOkay() !== i)) {
          inputs.push(generateBidInput('bid', i, currentBid, player));
        }
      });
    return inputs;
  };

  const showBidDialog = (player: string, cards: number, currentBid: number) => {
    showBidAlert({
      header: `Choose bid for ${player}`,
      backdropDismiss: true,
      keyboardClose: false,
      mode: "ios",
      inputs: generateInputs(player, cards, currentBid),
    })
  }

  const back = () => {

    const activeRound = game.roundState.activeRound;
    if (activeRound - 1 >= 0) {
      navigate('/trick');
      setTimeout(() => {
        dispatch({
          type: 'PREVIOUS_ROUND',
        })
      }, 100)
    } else {
      navigate('/newgame')
    }
  }

  const penalise = (amount: number, player: string) => {
    dispatch({
      type: 'SET_PENALTY',
      player,
      amount,
    })
  }

  useIonViewWillLeave(() => {
    storage.set('gameState', game);
  }, [game]);

  return round ? (
    <IonPage className="oh-hell">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => back()}>
              <IonIcon icon={chevronBack}/>
              Back
            </IonButton>
          </IonButtons>
          <IonTitle>Bid {round.cards}</IonTitle>
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
                          {bet.player === round.dealer && getBidNotOkay() >= 0 ?
                            <IonBadge color="danger">{getBidNotOkay()}</IonBadge> : null}
                        </IonCol>
                        <IonCol className="col-center" size="2" onClick={() => showBidDialog(bet.player, round.cards, bet.bid)}>
                          <IonText>{bet.bid}</IonText>
                        </IonCol>
                        <IonCol className="col-center" size="2">
                          <IonIcon color="medium" icon={remove}/>
                        </IonCol>
                        <IonCol className="col-center" size="2">
                          <IonBadge text-center
                                    color="see-through-black">
                              {calculatePlayerScore(game.roundState.rounds, bet.player, game.roundState.activeRound - 1)}
                          </IonBadge>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonItem>
                  <IonItemOptions side="start">
                    <IonItemOption color="danger">
                      <IonIcon icon={trash}/>
                    </IonItemOption>
                  </IonItemOptions>
                  <IonItemOptions side="end">
                    <PenaltyItemOption player={bet.player} onPenalise={(amount: number) => penalise(amount, bet.player)}/>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonItemGroup>
        </IonList>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton disabled={getTotalBid() === round.cards} mode="ios" className="floating-button"
                        routerLink="/trick">
            <IonIcon icon={arrowForwardOutline}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  ) : null;
};

export default BidPage;
