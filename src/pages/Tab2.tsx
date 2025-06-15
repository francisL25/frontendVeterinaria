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
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonDatetime,
  IonPopover,
  IonCheckbox,
  IonToast,
  IonIcon,
} from '@ionic/react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline } from 'ionicons/icons';
import api from '../services/api';
import UserMenu from '../components/UserMenu';

const Tab2: React.FC = () => {
  const { nombre } = useContext(AuthContext);
  const { triggerRefetch } = useContext(HistorialContext);

  const initialForm = {
    nombreMascota: '',
    raza: '',
    especie: '',
    fechaNacimiento: '',
    sexo: '',
    nombreDueno: '',
    carnetIdentidad: '',
    telefono: '',
    direccion: '',
    peso: '',
    castrado: false,
    esterilizado: false,
    seniaParticular: '',
    anamnesis: '',
    sintomasSignos: '',
    tratamiento: '',
    diagnostico: '',
    cita: '',
    doctorAtendio: '',
    fechaHistorial: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('danger');
  const [openPicker, setOpenPicker] = useState('');

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string, e: CustomEvent) => {
    setFormData(prev => ({ ...prev, [name]: e.detail.value }));
    setOpenPicker('');
  };

  const camposFecha = ['fechaNacimiento', 'cita', 'fechaHistorial'];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agregar Historial Completo</IonTitle>
          <UserMenu />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Nombre Mascota</IonLabel><IonInput name="nombreMascota" value={formData.nombreMascota} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Raza</IonLabel><IonInput name="raza" value={formData.raza} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Especie</IonLabel><IonInput name="especie" value={formData.especie} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Fecha Nacimiento</IonLabel>
                <IonButton id="fechaNacimiento" onClick={() => setOpenPicker('fechaNacimiento')}>Seleccionar Fecha</IonButton>
                {formData.fechaNacimiento && <IonLabel>{new Date(formData.fechaNacimiento).toLocaleDateString()}</IonLabel>}
              </IonItem>
              <IonPopover trigger="fechaNacimiento" isOpen={openPicker === 'fechaNacimiento'} onDidDismiss={() => setOpenPicker('')}>
                <IonDatetime presentation="date" onIonChange={(e) => handleDateChange('fechaNacimiento', e)} />
              </IonPopover>
            </IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Sexo</IonLabel>
              <IonSelect name="sexo" value={formData.sexo} onIonChange={handleInputChange}>
                <IonSelectOption value="Macho">Macho</IonSelectOption>
                <IonSelectOption value="Hembra">Hembra</IonSelectOption>
              </IonSelect>
            </IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Nombre Dueño</IonLabel><IonInput name="nombreDueno" value={formData.nombreDueno} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Carnet Identidad</IonLabel><IonInput name="carnetIdentidad" value={formData.carnetIdentidad} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Teléfono</IonLabel><IonInput name="telefono" value={formData.telefono} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Dirección</IonLabel><IonInput name="direccion" value={formData.direccion} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Peso (kg)</IonLabel><IonInput name="peso" value={formData.peso} type="number" onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="3"><IonItem><IonLabel>Castrado</IonLabel><IonCheckbox checked={formData.castrado} onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)} /></IonItem></IonCol>
            <IonCol size="3"><IonItem><IonLabel>Esterilizado</IonLabel><IonCheckbox checked={formData.esterilizado} onIonChange={(e) => handleCheckboxChange('esterilizado', e.detail.checked)} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Seña Particular</IonLabel><IonTextarea name="seniaParticular" value={formData.seniaParticular} onIonChange={handleInputChange} rows={2} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Anamnesis</IonLabel><IonTextarea name="anamnesis" value={formData.anamnesis} onIonChange={handleInputChange} rows={3} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Síntomas y Signos</IonLabel><IonTextarea name="sintomasSignos" value={formData.sintomasSignos} onIonChange={handleInputChange} rows={3} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Tratamiento</IonLabel><IonTextarea name="tratamiento" value={formData.tratamiento} onIonChange={handleInputChange} rows={3} /></IonItem></IonCol>
            <IonCol size="12"><IonItem><IonLabel position="stacked">Diagnóstico</IonLabel><IonTextarea name="diagnostico" value={formData.diagnostico} onIonChange={handleInputChange} rows={3} /></IonItem></IonCol>
            <IonCol size="6"><IonItem><IonLabel position="stacked">Doctor Atendió</IonLabel><IonInput name="doctorAtendio" value={formData.doctorAtendio} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Cita</IonLabel>
                <IonButton id="cita" onClick={() => setOpenPicker('cita')}>Seleccionar Cita</IonButton>
                {formData.cita && <IonLabel>{new Date(formData.cita).toLocaleString()}</IonLabel>}
              </IonItem>
              <IonPopover trigger="cita" isOpen={openPicker === 'cita'} onDidDismiss={() => setOpenPicker('')}>
                <IonDatetime presentation="date-time" onIonChange={(e) => handleDateChange('cita', e)} />
              </IonPopover>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Fecha Historial</IonLabel>
                <IonButton id="fechaHistorial" onClick={() => setOpenPicker('fechaHistorial')}>Seleccionar Fecha</IonButton>
                {formData.fechaHistorial && <IonLabel>{new Date(formData.fechaHistorial).toLocaleString()}</IonLabel>}
              </IonItem>
              <IonPopover trigger="fechaHistorial" isOpen={openPicker === 'fechaHistorial'} onDidDismiss={() => setOpenPicker('')}>
                <IonDatetime presentation="date-time" onIonChange={(e) => handleDateChange('fechaHistorial', e)} />
              </IonPopover>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
