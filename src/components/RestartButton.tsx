import { IonButton, IonIcon, NavContext, useIonAlert } from "@ionic/react";
import { refresh } from "ionicons/icons";
import { useContext } from "react";

export const RestartButton: React.FC = () => {
  const { navigate } = useContext(NavContext)
  const [showRestartAlert] = useIonAlert();

  const showRestartDialog = () => {
    showRestartAlert({
      header: `Are you sure you want to restart the game?`,
      backdropDismiss: true,
      keyboardClose: false,
      mode: "ios",
      buttons: [
        'Cancel',
        {
          text: 'Restart', handler: () => {
            navigate('/')
          }
        },
      ],
    })
  }
  return (
    <IonButton onClick={() => showRestartDialog()}>
      <IonIcon title="Refresh" icon={refresh} />
    </IonButton>
  )
}
