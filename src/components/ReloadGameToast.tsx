import { IonToast, NavContext } from "@ionic/react";
import { arrowForward, close } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";

import type { Game } from "../@types/state";
import { isUnfinished } from "../models/GameUtil";

interface ReloadGameProps {
  loadedGame: Game;
  allowedRoute: string | undefined
}

export const ReloadGameToast: React.FC<ReloadGameProps> = (props) => {
  const { navigate, routeInfo } = useContext(NavContext);
  const [showReloadGame, setShowReloadGame] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (isUnfinished(props.loadedGame) && !toastShown && props.allowedRoute === routeInfo?.pathname) {
      setTimeout(() => {
        setShowReloadGame(true);
        setToastShown(true);
      }, 1000)
    }
  }, [props.loadedGame])

  return (
    <IonToast
      cssClass={"reload-game"}
      isOpen={showReloadGame}
      onDidDismiss={() => setShowReloadGame(false)}
      message="Unfinished game detected. Continue game?"
      position="bottom"
      color="warning"
      buttons={[
        {
          side: 'start',
          role: 'cancel',
          icon: close,
        },
        {
          text: '',
          side: 'end',
          icon: arrowForward,
          handler: () => {
            navigate('/bid');
          }
        }
      ]}
    />
  );
}
