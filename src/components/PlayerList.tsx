import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList } from "@ionic/react";
import React, { Component } from "react";

interface IProps {
    players: string[];
}

export default class PlayerList extends Component<IProps> {
    private playerList = this.props.players.map((value, index) => {
        return (
            <IonItemSliding key={index}>
                <IonItem>
                    <IonLabel>{value}</IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => {console.log(index);}}>
                        <IonIcon name="trash" slot="icon-only"/>
                    </IonItemOption>
                </IonItemOptions>
            </IonItemSliding>
        );
    });

    public render() {
        return (
            <IonList>{this.playerList}</IonList>
        );
    }
}
