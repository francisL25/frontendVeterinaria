import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import EditTab from './pages/EditTab';
import HistorialFecha from './pages/historialFecha';
import { AuthProvider } from './context/AuthContext';
import { HistorialProvider } from './context/HistorialContext';

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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <HistorialProvider>
          <IonRouterOutlet>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/tabs/tab1">
              <Tab1 />
            </Route>
            <Route exact path="/tabs/tab2">
              <Tab2 />
            </Route>
            <Route exact path="/edit-tab/:id">
              <EditTab />
            </Route>
            <Route exact path="/historial/:id">
              <HistorialFecha />
            </Route>
            <Route exact path="/tabs">
              <Redirect to="/tabs/tab1" />
            </Route>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>

        </HistorialProvider>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;