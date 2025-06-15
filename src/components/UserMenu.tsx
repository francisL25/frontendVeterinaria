import React, { useContext } from 'react';
import { IonItem, IonLabel, IonButton, IonIcon } from '@ionic/react';
import { AuthContext } from '../context/AuthContext';
import { personOutline } from 'ionicons/icons';

const UserMenu: React.FC = () => {
    const { nombre, logout } = useContext(AuthContext);

    return (
        <IonItem slot="end" lines="none" className="detalles-arriba" >
            <IonIcon icon={personOutline} slot="start" style={{ color: 'white', fontSize: '20px', marginRight: '8px' }} />
            <IonLabel style={{ color: "white",fontWeight: 'bold' }}>{nombre || ''}</IonLabel>
            <IonButton size="small" onClick={logout} color="danger" fill="solid">
                Cerrar Sesión
            </IonButton>
        </IonItem>
    );
};

export default UserMenu;
