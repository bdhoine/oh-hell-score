import { IonIcon, IonItemOption, useIonAlert } from "@ionic/react";
import { thumbsDown } from "ionicons/icons";

interface PenaltyProps {
    player: string;
    penaltyPoints?: number;
    onPenalise: (penaltyPoints: number) => void;
}

export const PenaltyItemOption: React.FC<PenaltyProps> = ({ player, penaltyPoints = 5, onPenalise }) => {
    const [showPenaltyAlert] = useIonAlert();

    const showPenaltyDialog = (player: string) => {
        showPenaltyAlert({
            header: `Give a -5 penalty to ${player}?`,
            backdropDismiss: true,
            keyboardClose: false,
            mode: "ios",
            buttons: [
                'Cancel',
                {
                    text: 'Penalise', handler: () => {
                        onPenalise(penaltyPoints);
                        return true;
                    }
                },
            ],
        })
    }
    return (
        <IonItemOption color="danger" >
            <IonIcon icon={thumbsDown} onClick={() => showPenaltyDialog(player)} />
        </IonItemOption>
    )
}
