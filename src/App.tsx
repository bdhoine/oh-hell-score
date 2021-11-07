import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import NewGame from './pages/NewGame';
import BidPage from './pages/Bid';
import TrickPage from './pages/Trick';
import { AppStateProvider } from './state/providers/AppStateProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import ScorePage from "./pages/Score";

const App: React.FC = () => (
  <AppStateProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/newgame">
            <NewGame />
          </Route>
          <Route exact path="/bid">
            <BidPage />
          </Route>
          <Route path="/trick">
            <TrickPage />
          </Route>
          <Route path="/score">
            <ScorePage />
          </Route>
          <Route exact path="/">
            <Redirect to="/newgame" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AppStateProvider>

);

export default App;
