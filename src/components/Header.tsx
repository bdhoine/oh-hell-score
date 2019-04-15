import React, { Component } from 'react'
import { IonHeader, IonToolbar, IonTitle } from '@ionic/react';

interface Props {
    title: string
}

export default class Header extends Component<Props> {
  render() {
    return (
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>{this.props.title}</IonTitle>
          </IonToolbar>
        </IonHeader>
    )
  }
}
