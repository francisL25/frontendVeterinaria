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
          <IonTitle className="custom-title text-center"><h1>CLÍNICA VETERINARIA QUERUBINES</h1></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding bg-gradient-to-b from-purple-100 to-white">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">

          {/* Tarjeta con borde morado */}
          <div className="bg-white border-2 border-purple-500 shadow-xl rounded-2xl p-8 w-full max-w-md">

            <div className="flex justify-center mb-4">
              <IonIcon icon={personCircleSharp} className="text-purple-600 text-6xl" />
            </div>

            <h1 className="text-2xl font-bold text-center text-purple-700 mb-2">
              Bienvenido
            </h1>
            <p className="text-center text-gray-500 mb-6">
              Por favor, ingresa tus credenciales
            </p>

            <IonItem lines="none" className="mb-4">
              <IonInput
                fill="solid"
                label="Usuario"
                labelPlacement="floating"
                placeholder="Introduzca su Usuario"
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value!)}
                type="text"
                required
              />
            </IonItem>

            <IonItem lines="none" className="mb-6">
              <IonInput
                fill="solid"

                label="Contraseña"
                labelPlacement="floating"
                placeholder="Introduzca su Contraseña"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                type="password"
                required
              />
            </IonItem>
            <div className="ion-text-center">
              <IonButton
                fill="clear"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
                onClick={handleLogin}
              >
                Iniciar Sesión
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
