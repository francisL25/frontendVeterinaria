import React, { useContext } from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { personOutline } from 'ionicons/icons';

interface UserMenuProps {
  titulo?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ titulo }) => {
  const { nombre, logout } = useContext(AuthContext);

  return (
    <div className="w-full flex items-center justify-between px-4 py-2">
      {/* Texto a la izquierda */}
      <div className="text-white text-2xl font-semibold">{titulo || ''}</div>

      {/* Usuario a la derecha */}
      <div className="flex items-center gap-4">
        <IonIcon icon={personOutline} style={{ color: 'white', fontSize: '20px' }} />
        <div className="text-white font-bold truncate">{nombre || ''}</div>
        <IonButton size="small" onClick={logout} color="danger" fill="solid">
          Cerrar Sesión
        </IonButton>
      </div>
    </div>
  );
};

export default UserMenu;
