import { IonApp, IonContent } from "@ionic/react";
import React, { Component } from "react";
import Header from "../components/Header";
import PlayerList from "../components/PlayerList";

export default class NewGame extends Component {
    public state = {
        players: ["Barry", "Siel", "Billie"],
    };
    public render() {
        return (
            <IonApp>
                <Header title="New Game" />
                <IonContent>
                    <PlayerList players={this.state.players} />
                </IonContent>
            </IonApp>
        );
    }
}
