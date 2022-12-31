import type { AlertInput } from "@ionic/react";
import { IonIcon, IonItemOption, useIonAlert } from "@ionic/react";
import { thumbsDown } from "ionicons/icons";

const penaltyOptionList = [2, 3, 5] as const;
type PenaltyPoints = typeof penaltyOptionList[number];
interface PenaltyProps {
    player: string;
    penaltyPoints?: PenaltyPoints;
    onPenalise: (penaltyPoints: number) => void;
    onClick?: () => void;
}

export const PenaltyItemOption: React.FC<PenaltyProps> = ({ player, penaltyPoints = 5, onPenalise }) => {
    const [showPenaltyAlert] = useIonAlert();

    const generateInputs = (): AlertInput[] => {
        return penaltyOptionList
            .map((point: number) => {
                return {
                    name: 'penalty',
                    type: 'radio',
                    checked: penaltyPoints === point,
                    label: String(-point),
                    value: point,
                }
            });
    };

    const showPenaltyDialog = (player: string) => {
        showPenaltyAlert({
            header: `Give a penalty to ${player}?`,
            backdropDismiss: true,
            keyboardClose: false,
            mode: "ios",
            inputs: generateInputs(),
            buttons: [
                'Cancel',
                {
                    text: 'Penalise', handler: (points) => {
                        onPenalise(points);
                        return true;
                    }
                },
            ],
        })
    }

    return (
        <IonItemOption color="danger" onClick={() => showPenaltyDialog(player)}>
            <IonIcon icon={thumbsDown} />
        </IonItemOption>
    )
}
