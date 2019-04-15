import { IonApp, IonContent } from '@ionic/react';
import React, { Component } from 'react';
import Header from './components/Header';
import PlayerList from './components/PlayerList';

class App extends Component {
  state = {
    players: ["Barry", "Siel", "Billie"],
  };

  render() {
    return (
      <IonApp>
        <Header title="New Game"/>
        <IonContent>
          <PlayerList players={this.state.players}/>
        </IonContent>
      </IonApp>
    );
  }
}

export default App;
