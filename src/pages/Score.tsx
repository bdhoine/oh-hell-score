import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonList,
  IonPage,
  IonRippleEffect,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  NavContext
} from '@ionic/react';
import {trophy} from 'ionicons/icons';
import {useContext} from 'react';

import type {PlayerScore} from '../@types/state';
import {getTrophy} from "../models/TrophyColors";
import {useGameState} from '../state/providers/AppStateProvider';
import {calculateFinalScore} from '../util/round.util';

import './BidTrick.scss';
import './Score.scss'

const ScorePage: React.FC = () => {
  const {game} = useGameState();
  const {navigate} = useContext(NavContext)

  return (
    <IonPage className="oh-hell">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/"/>
          </IonButtons>
          <IonTitle>Final Score</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="oh-hell__round">
          <IonItemGroup>
            <IonItem color="primary">
              <IonGrid>
                <IonRow>
                  <IonCol size="8">Player</IonCol>
                  <IonCol className="col-center" size="3">Score</IonCol>
                  <IonCol className="col-center" size="1"/>
                </IonRow>
              </IonGrid>
            </IonItem>
          </IonItemGroup>
          <IonItemGroup>
            {calculateFinalScore(game).map((playerScore: PlayerScore, i) => {
              return (
                <IonItem key={playerScore.player}>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="8" className="oh-hell__player">
                        <IonText>{playerScore.player}</IonText>
                      </IonCol>
                      <IonCol className="col-center" size="3">
                        {playerScore.score}
                      </IonCol>
                      <IonCol className="col-center" size="1">
                        {i < 3 ? <IonIcon color={getTrophy(i + 1)} icon={trophy}/> : null}
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
              )
            })}
          </IonItemGroup>
          <IonButton className="oh-hell__bottom-button" expand="block" onClick={() => navigate('/')}>
            New Game
            <IonRippleEffect type="unbounded"/>
          </IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
};

export default ScorePage;
