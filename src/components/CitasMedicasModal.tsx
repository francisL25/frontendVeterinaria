import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
  IonButtons,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

interface CitaMedica {
  id: number;
  nombreMascota: string;
  nombreDueno: string;
  telefono: string;
  cita: string;
}

interface CitasMedicasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CitasMedicasModal: React.FC<CitasMedicasModalProps> = ({ isOpen, onClose }) => {
  const [citas, setCitas] = useState<CitaMedica[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  // Función para obtener citas médicas del backend
  const fetchCitas = async () => {
    try {
      setLoading(true);
      const fecha = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const response = await api.get(`/historialFecha/por-fecha?fecha=${fecha}`);
      
      // Validar que la respuesta tenga datos
      if (response.data && Array.isArray(response.data)) {
        setCitas(response.data);
      } else {
        setCitas([]);
      }
    } catch (error: any) {
      console.error('Error al cargar citas:', error);
      setCitas([]); // Limpiar citas en caso de error
      setToastMessage('Error al cargar las citas médicas');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      fetchCitas();
    } else {
      // Limpiar estado cuando se cierra el modal
      setCitas([]);
      setShowToast(false);
    }
  }, [isOpen]);

  // Función para formatear la fecha y hora
  const formatDateTime = (dateString: string) => {
    try {
      const fecha = dayjs(dateString);
      return fecha.isValid() ? fecha.format('DD/MM/YYYY HH:mm') : 'Fecha inválida';
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para manejar el cierre del modal
  const handleClose = () => {
    setShowToast(false);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar className='color-boton'>
          <IonTitle>Citas Médicas - {dayjs().add(1, 'day').format('DD/MM/YYYY')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose} fill="clear">
              Cerrar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center" style={{ marginTop: '2rem' }}>
            <IonSpinner name="crescent" />
            <p>Cargando citas médicas...</p>
          </div>
        ) : citas.length > 0 ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Total de citas: {citas.length}</strong></p>
            </div>
            {citas.map((cita) => (
              <IonItem key={cita.id} lines="full">
                <IonLabel>
                  <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {cita.nombreMascota}
                  </h2>
                  <p style={{ margin: '0.2rem 0' }}>
                    <strong>Dueño:</strong> {cita.nombreDueno}
                  </p>
                  <p style={{ margin: '0.2rem 0' }}>
                    <strong>Teléfono:</strong> {cita.telefono}
                  </p>
                  <p style={{ margin: '0.2rem 0' }}>
                    <strong>Fecha y hora:</strong> {formatDateTime(cita.cita)}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </>
        ) : (
          <div className="ion-text-center" style={{ marginTop: '2rem' }}>
            <p>No hay citas médicas programadas para mañana.</p>
          </div>
        )}

        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="bottom"
        />
      </IonContent>
    </IonModal>
  );
};

export default CitasMedicasModal;