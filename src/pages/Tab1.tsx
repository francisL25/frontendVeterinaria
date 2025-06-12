import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonToast,
  IonAlert,
  IonButtons
} from '@ionic/react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { useIonRouter } from '@ionic/react';
import api from '../services/api';
import './Tab1.css';

interface InformacionMascota { // Cambiado a minúscula
  edad: number;
  peso: number;
  sexo: string;
  castrado: boolean;
  esterilizado: boolean;
}

interface Historial {
  id: number;
  nombreMascota: string;
  nombreDueño: string;
  doctorAtendio: string;
  anamnesis: string;
  sintomasSignos: string;
  tratamiento: string;
  diagnostico: string;
  cita: string | null;
  informacionMascota: InformacionMascota | null; // Cambiado a minúscula
}

const Tab1: React.FC = () => {
  const { nombre, logout } = useContext(AuthContext);
  const { refetchFlag, triggerRefetch } = useContext(HistorialContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [selectedHistorial, setSelectedHistorial] = useState<Historial | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState('danger');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const router = useIonRouter();

  useEffect(() => {
    fetchHistoriales();
  }, [refetchFlag]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchHistoriales();
    } else {
      searchHistoriales();
    }
  }, [searchTerm]);

  const fetchHistoriales = async () => {
    try {
      const response = await api.get('/historial');
      console.log('Historiales cargados:', response.data); // Añadir para depurar
      setHistoriales(response.data);
    } catch (error: any) {
      setToastMessage('Error al cargar historiales');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const searchHistoriales = async () => {
    try {
      const response = await api.get('/historial/search', {
        params: { nombreMascota: searchTerm }
      });
      console.log('Historiales buscados:', response.data); // Añadir para depurar
      setHistoriales(response.data);
    } catch (error: any) {
      setToastMessage('Error al buscar historiales');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const openDetails = (historial: Historial) => {
    console.log('Historial seleccionado:', historial); // Añadir para depurar
    setSelectedHistorial(historial);
    setShowModal(true);
  };

  const handleAddHistorial = () => {
    router.push('/tabs/tab2', 'forward', 'push');
  };

  const handleDeleteHistorial = async () => {
    if (!selectedHistorial) return;

    try {
      await api.delete(`/historial/${selectedHistorial.id}`);
      console.log('Historial eliminado:', selectedHistorial.id); // Añadir para depurar
      setShowModal(false);
      setToastMessage('Historial eliminado con éxito');
      setToastColor('success');
      setShowToast(true);
      triggerRefetch();
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Error al eliminar historial');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleEditHistorial = () => {
    if (selectedHistorial) {
      setShowModal(false);
      router.push(`/edit-tab/${selectedHistorial.id}`, 'forward', 'push');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
          <IonItem slot="end" lines="none">
            <IonLabel>{nombre || 'Usuario'}</IonLabel>
            <IonButton onClick={logout} color="danger" fill="clear">
              Cerrar Sesión
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonItem lines="none" className="search-container">
          <IonButton slot="start" onClick={handleAddHistorial} color="primary">
            Agregar Historial
          </IonButton>
          <IonInput
            slot="end"
            placeholder="text"
            value={searchTerm}
            onIonChange={(e) => setSearchTerm(e.detail.value!)}
            clearInput
            className="search-input"
          />
        </IonItem>
        <IonGrid>
          <IonRow className="table-row-header">
            <IonCol size="2">Nro</IonCol>
            <IonCol size="3">Mascota</IonCol>
            <IonCol size="3">Dueño</IonCol>
            <IonCol size="3">Doctor Atendió</IonCol>
            <IonCol size="1"></IonCol>
          </IonRow>
          {historiales.map((historial, index) => (
            <IonRow key={historial.id} className="table-row">
              <IonCol size="2">{index + 1}</IonCol>
              <IonCol size="3">{historial.nombreMascota}</IonCol>
              <IonCol size="3">{historial.nombreDueño}</IonCol>
              <IonCol size="3">{historial.doctorAtendio}</IonCol>
              <IonCol size="1">
                <IonButton fill="clear" onClick={() => openDetails(historial)}>
                  Ver más
                </IonButton>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="details-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Detalles del Historial</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedHistorial && (
              <IonGrid className="details-table">
                <IonRow className="details-row">
                  <IonCol><strong>Mascota</strong><br/>{selectedHistorial.nombreMascota}</IonCol>
                  <IonCol><strong>Dueño</strong><br/>{selectedHistorial.nombreDueño}</IonCol>
                  <IonCol><strong>Edad</strong><br/>{selectedHistorial.informacionMascota?.edad ?? 'N/A'} años</IonCol>
                  <IonCol><strong>Peso</strong><br/>{selectedHistorial.informacionMascota?.peso ?? 'N/A'} kg</IonCol>
                  <IonCol><strong>Sexo</strong><br/>{selectedHistorial.informacionMascota?.sexo ?? 'N/A'}</IonCol>
                  <IonCol><strong>Castrado</strong><br/>{selectedHistorial.informacionMascota ? (selectedHistorial.informacionMascota.castrado ? 'Sí' : 'No') : 'N/A'}</IonCol>
                  <IonCol><strong>Esterilizado</strong><br/>{selectedHistorial.informacionMascota ? (selectedHistorial.informacionMascota.esterilizado ? 'Sí' : 'No') : 'N/A'}</IonCol>
                </IonRow>
                <IonRow className="details-row">
                  <IonCol size="12"><strong>Anamnesis</strong><br/>{selectedHistorial.anamnesis}</IonCol>
                </IonRow>
                <IonRow className="details-row">
                  <IonCol size="12"><strong>Síntomas y Signos</strong><br/>{selectedHistorial.sintomasSignos}</IonCol>
                </IonRow>
                <IonRow className="details-row">
                  <IonCol size="12"><strong>Tratamiento</strong><br/>{selectedHistorial.tratamiento}</IonCol>
                </IonRow>
                <IonRow className="details-row">
                  <IonCol size="12"><strong>Diagnóstico</strong><br/>{selectedHistorial.diagnostico}</IonCol>
                </IonRow>
                <IonRow className="details-row">
                  <IonCol><strong>Doctor Atendió</strong><br/>{selectedHistorial.doctorAtendio}</IonCol>
                  <IonCol><strong>Cita</strong><br/>{selectedHistorial.cita ? new Date(selectedHistorial.cita).toLocaleString() : 'N/A'}</IonCol>
                </IonRow>
              </IonGrid>
            )}
          </IonContent>
          <IonToolbar slot="bottom">
            <IonButtons slot="start">
              <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>Eliminar</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton color="primary" onClick={handleEditHistorial}>Editar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmar Eliminación"
          message="¿Estás seguro de que deseas eliminar este historial? Esta acción no se puede deshacer."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDeleteHistorial
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;