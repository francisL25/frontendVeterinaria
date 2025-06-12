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
import './Login.css'; // Importa aquí tu CSS personalizado

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
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="toolbar-custom">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding login-content">
        <div className="login-container">
          <IonItem className="input-item" lines="full" color="light">
            <IonLabel position="floating">Usuario</IonLabel>
            <IonInput
              value={usuario}
              onIonChange={(e) => setUsuario(e.detail.value!)}
              type="text"
              required
            />
          </IonItem>
          <IonItem className="input-item" lines="full" color="light">
            <IonLabel position="floating">Contraseña</IonLabel>
            <IonInput
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              type="password"
              required
            />
          </IonItem>
          <IonButton
            expand="block"
            onClick={handleLogin}
            className="login-button ion-margin-top"
          >
            Iniciar Sesión
          </IonButton>
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
