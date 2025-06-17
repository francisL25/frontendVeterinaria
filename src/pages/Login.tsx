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
  IonToast,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { personCircleSharp } from 'ionicons/icons';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const history = useHistory();

  const handleLogin = async () => {
    // Validación básica
    if (!usuario.trim() || !password.trim()) {
      setToastMessage('Por favor complete todos los campos');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(usuario, password);
      history.push('/tabs/tab1');
    } catch (error: any) {
      setToastMessage(error.message || 'Error al iniciar sesión');
      setShowToast(true);
      setUsuario('');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <IonTitle className="custom-title">
            CLÍNICA VETERINARIA QUERUBINES
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div className="login-container">
          {/* Tarjeta de login */}
          <div className="login-card">
            <div className="login-icon">
              <IonIcon icon={personCircleSharp} />
            </div>

            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">
              Por favor, ingresa tus credenciales
            </p>

            <IonItem lines="none" className="login-input-item">
              <IonInput
                fill="solid"
                label="Usuario"
                labelPlacement="floating"
                placeholder="Introduzca su usuario"
                value={usuario}
                onIonInput={(e) => setUsuario(e.detail.value!)}
                onKeyDown={handleKeyPress}
                type="text"
                required
                disabled={isLoading}
              />
            </IonItem>

            <IonItem lines="none" className="login-input-item">
              <IonInput
                fill="solid"
                label="Contraseña"
                labelPlacement="floating"
                placeholder="Introduzca su contraseña"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                onKeyDown={handleKeyPress}
                type="password"
                required
                disabled={isLoading}
              />
            </IonItem>

            <div className="login-button-container">
              <IonButton
                expand="block"
                className="login-button"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </IonButton>
            </div>
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