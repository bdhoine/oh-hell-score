import { IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import React, { Component } from "react";

interface IProps {
    title: string;
}

export default class Header extends Component<IProps> {
    public render() {
        return (
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>{this.props.title}</IonTitle>
                </IonToolbar>
            </IonHeader>
        );
    }
}
