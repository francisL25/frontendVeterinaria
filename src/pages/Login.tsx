// Login.tsx
import React, { useState, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { login } = useContext(AuthContext);
  const history = useHistory();

  const handleLogin = async () => {
    try {
      await login(usuario, password);
      history.push('/tabs/tab1');
    } catch (error: any) {
      setToastMessage(error.message);
      setShowToast(true);
      setUsuario('');
      setPassword('');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="custom-toolbar">
          <IonTitle className="custom-title"><h1>CLÍNICA VETERINARIA QUERUBINES</h1></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="login-content ion-no-padding">
        <div className="login-wrapper">
          <div className="login-container">
            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Por favor, ingresa tus credenciales</p>
            <IonItem className="login-input">
              <IonLabel position="stacked"><h1>Usuario</h1></IonLabel>
              <IonInput
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value!)}
                type="text"
                required
              />
            </IonItem>
            <IonItem className="login-input">
              <IonLabel position="stacked"><h1>Password</h1></IonLabel>
              <IonInput
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                type="password"
                required
              />
            </IonItem>

            <IonButton expand="block" onClick={handleLogin} className="login-button">
              Iniciar Sesión
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>

    </IonPage>
  );
};

export default Login;
