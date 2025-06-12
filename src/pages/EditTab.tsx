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
  IonModal,
  IonIcon
} from '@ionic/react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { checkmarkCircleOutline } from 'ionicons/icons';
import api from '../services/api';
import './Tab2.css'; // Reusamos los estilos de Tab2

interface InformacionMascota {
  edad: string;
  peso: string;
  sexo: string;
  castrado: boolean;
  esterilizado: boolean;
  [key: string]: string | boolean;
}

interface FormData {
  nombreMascota: string;
  nombreDueño: string;
  anamnesis: string;
  sintomasSignos: string;
  tratamiento: string;
  diagnostico: string;
  doctorAtendio: string;
  cita: string;
  informacionMascota: InformacionMascota;
  [key: string]: any;
}

const EditTab: React.FC = () => {
  const { nombre, logout } = useContext(AuthContext);
  const { triggerRefetch } = useContext(HistorialContext);
  const router = useIonRouter();
  const { id } = useParams<{ id: string }>();

  const initialFormData: FormData = {
    nombreMascota: '',
    nombreDueño: '',
    anamnesis: '',
    sintomasSignos: '',
    tratamiento: '',
    diagnostico: '',
    doctorAtendio: '',
    cita: '',
    informacionMascota: {
      edad: '',
      peso: '',
      sexo: '',
      castrado: false,
      esterilizado: false
    }
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState('danger');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useIonViewWillEnter(() => {
    const fetchHistorial = async () => {
      try {
        const response = await api.get(`/historial/${id}`);
        const historial = response.data;
        setFormData({
          nombreMascota: historial.nombreMascota || '',
          nombreDueño: historial.nombreDueño || '',
          anamnesis: historial.anamnesis || '',
          sintomasSignos: historial.sintomasSignos || '',
          tratamiento: historial.tratamiento || '',
          diagnostico: historial.diagnostico || '',
          doctorAtendio: historial.doctorAtendio || '',
          cita: historial.cita || '',
          informacionMascota: {
            edad: historial.InformacionMascotum?.edad?.toString() || '',
            peso: historial.InformacionMascotum?.peso?.toString() || '',
            sexo: historial.InformacionMascotum?.sexo || '',
            castrado: historial.InformacionMascotum?.castrado || false,
            esterilizado: historial.InformacionMascotum?.esterilizado || false
          }
        });
      } catch (error: any) {
        setToastMessage('Error al cargar el historial');
        setToastColor('danger');
        setShowToast(true);
      }
    };
    fetchHistorial();
  }, [id]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (['edad', 'peso', 'sexo'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        informacionMascota: { ...prev.informacionMascota, [name]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      informacionMascota: {
        ...prev.informacionMascota,
        castrado: name === 'castrado' ? checked : prev.informacionMascota.castrado,
        esterilizado: name === 'esterilizado' ? checked : prev.informacionMascota.esterilizado
      }
    }));
  };

  const handleDateChange = (e: CustomEvent) => {
    setFormData((prev) => ({ ...prev, cita: e.detail.value }));
    setShowDatePicker(false);
  };

  const validateForm = () => {
    const requiredFields = [
      'nombreMascota',
      'nombreDueño',
      'anamnesis',
      'sintomasSignos',
      'tratamiento',
      'diagnostico',
      'doctorAtendio'
    ];
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `El campo ${field} es obligatorio`;
      }
    }
    const infoMascotaFields = ['edad', 'peso', 'sexo'];
    for (const field of infoMascotaFields) {
      const value = formData.informacionMascota[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `El campo ${field} de información de la mascota es obligatorio`;
      }
    }
    if (isNaN(Number(formData.informacionMascota.edad)) || Number(formData.informacionMascota.edad) <= 0) {
      return 'La edad debe ser un número positivo';
    }
    if (isNaN(Number(formData.informacionMascota.peso)) || Number(formData.informacionMascota.peso) <= 0) {
      return 'El peso debe ser un número positivo';
    }
    return null;
  };

  const handleSaveHistorial = async () => {
    const validationError = validateForm();
    if (validationError) {
      setToastMessage(validationError);
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const payload = {
        ...formData,
        cita: formData.cita ? new Date(formData.cita).toISOString().split('T')[0] : null,
        informacionMascota: {
          edad: Number(formData.informacionMascota.edad),
          peso: Number(formData.informacionMascota.peso),
          sexo: formData.informacionMascota.sexo,
          castrado: formData.informacionMascota.castrado,
          esterilizado: formData.informacionMascota.esterilizado
        }
      };

      await api.put(`/historial/${id}`, payload);
      setShowSuccessModal(true);
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Error al guardar historial');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setFormData(initialFormData);
    triggerRefetch();
    router.push('/tabs/tab1', 'root', 'replace');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar Historial</IonTitle>
          <IonItem slot="end" lines="none">
            <IonLabel>{nombre || 'Usuario'}</IonLabel>
            <IonButton onClick={logout} color="danger" fill="clear">
              Cerrar Sesión
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonGrid className="form-table">
          <IonRow>
            <IonCol><IonItem><IonLabel position="stacked">Mascota</IonLabel><IonInput name="nombreMascota" value={formData.nombreMascota} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol><IonItem><IonLabel position="stacked">Dueño</IonLabel><IonInput name="nombreDueño" value={formData.nombreDueño} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol><IonItem><IonLabel position="stacked">Edad (años)</IonLabel><IonInput name="edad" type="number" value={formData.informacionMascota.edad} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol><IonItem><IonLabel position="stacked">Peso (kg)</IonLabel><IonInput name="peso" type="number" step="0.1" value={formData.informacionMascota.peso} onIonChange={handleInputChange} /></IonItem></IonCol>
            <IonCol><IonItem><IonLabel position="stacked">Sexo</IonLabel>
              <IonSelect name="sexo" value={formData.informacionMascota.sexo} onIonChange={handleInputChange} placeholder="Seleccionar">
                <IonSelectOption value="Macho">Macho</IonSelectOption>
                <IonSelectOption value="Hembra">Hembra</IonSelectOption>
              </IonSelect>
            </IonItem></IonCol>
            <IonCol><IonItem><IonLabel>Castrado</IonLabel><IonCheckbox name="castrado" checked={formData.informacionMascota.castrado} onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)} /></IonItem></IonCol>
            <IonCol><IonItem><IonLabel>Esterilizado</IonLabel><IonCheckbox name="esterilizado" checked={formData.informacionMascota.esterilizado} onIonChange={(e) => handleCheckboxChange('esterilizado', e.detail.checked)} /></IonItem></IonCol>
          </IonRow>

          <IonRow><IonCol size="12"><IonLabel position="stacked">Anamnesis</IonLabel><IonTextarea name="anamnesis" value={formData.anamnesis} onIonChange={handleInputChange} rows={3} /></IonCol></IonRow>
          <IonRow><IonCol size="12"><IonLabel position="stacked">Síntomas y Signos</IonLabel><IonTextarea name="sintomasSignos" value={formData.sintomasSignos} onIonChange={handleInputChange} rows={3} /></IonCol></IonRow>
          <IonRow><IonCol size="12"><IonLabel position="stacked">Tratamiento</IonLabel><IonTextarea name="tratamiento" value={formData.tratamiento} onIonChange={handleInputChange} rows={3} /></IonCol></IonRow>
          <IonRow><IonCol size="12"><IonLabel position="stacked">Diagnóstico</IonLabel><IonTextarea name="diagnostico" value={formData.diagnostico} onIonChange={handleInputChange} rows={3} /></IonCol></IonRow>

          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel position="stacked">Doctor Atendió</IonLabel>
                <IonInput name="doctorAtendio" value={formData.doctorAtendio} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonLabel position="stacked">Cita</IonLabel>
                <IonButton id="open-date-picker" onClick={() => setShowDatePicker(true)}>
                  Seleccionar Fecha
                </IonButton>
                <IonPopover trigger="open-date-picker" isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
                  <IonDatetime name="cita" value={formData.cita} onIonChange={handleDateChange} presentation="date-time" />
                </IonPopover>
                {formData.cita && <IonLabel>{new Date(formData.cita).toLocaleString()}</IonLabel>}
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonButton expand="block" onClick={() => router.push('/tabs/tab1')} color="medium">
                Cancelar
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" onClick={handleSaveHistorial} color="primary">
                Guardar Cambios
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />

        <IonModal isOpen={showSuccessModal} onDidDismiss={handleCloseSuccessModal} className="success-modal">
          <IonContent className="ion-padding ion-text-center">
            <IonIcon icon={checkmarkCircleOutline} color="success" size="large" />
            <h2>Éxito</h2>
            <p>El historial clínico ha sido actualizado correctamente.</p>
            <IonButton onClick={handleCloseSuccessModal} color="primary">Aceptar</IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default EditTab;