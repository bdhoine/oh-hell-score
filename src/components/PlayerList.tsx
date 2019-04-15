import React, { Component } from 'react'
import { IonList, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon } from '@ionic/react';

interface Props {
    players: string[];
}

export default class PlayerList extends Component<Props> {
  render() {
    return (
        <IonList>
        {
          this.props.players.map((value, index) => {
            return (
              <IonItemSliding key={index}>
                <IonItem>
                  <IonLabel>{value}</IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => { console.log(index); }}>
                    <IonIcon name="trash" slot="icon-only"></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })
        }
      </IonList>
    )
  }
}
