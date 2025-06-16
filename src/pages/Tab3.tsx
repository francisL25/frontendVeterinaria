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
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline } from 'ionicons/icons';
import api from '../services/api';
import UserMenu from '../components/UserMenu';

const Tab3: React.FC = () => {
  const { idH } = useParams<{ idH: string }>();
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

  const handleSubmit = async () => {
    const camposObligatorios = [
      'nombreMascota',
      'raza',
      'especie',
      'fechaNacimiento',
      'sexo',
      'nombreDueno',
      'carnetIdentidad',
      'telefono',
      'direccion',
      'peso',
      'anamnesis',
      'sintomasSignos',
      'diagnostico',
      'fechaHistorial'
    ];

    const camposFaltantes = camposObligatorios.filter(
      (campo) => !formData[campo as keyof typeof formData]
    );

    if (camposFaltantes.length > 0) {
      setToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const dataConHistorial = {
        ...formData,
        idH: idH
      };

      const response = await api.post(`/historialFecha/${idH}`, dataConHistorial);
      if (response.status === 201) {
        setToastMessage('Historial por fecha creado correctamente');
        setToastColor('success');
        setShowToast(true);
        triggerRefetch();
        setFormData(initialForm);
      }
    } catch (error) {
      console.error(error);
      setToastMessage('Error al guardar el historial por fecha');
      setToastColor('danger');
      setShowToast(true);
    }


    try {
      const dataConHistorial = {
        ...formData,
        idH: idH
      };

      const response = await api.put(`/historial/${idH}`, dataConHistorial);
      if (response.status === 201) {
        setToastMessage('Historial Actualizado correctamente');
        setToastColor('success');
        setShowToast(true);
        triggerRefetch();
        setFormData(initialForm);
      }
    } catch (error) {
      console.error(error);
      setToastMessage('Error al guardar el historial por fecha');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Agregar Datos Por Fecha" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="mb-4">
          <IonButton routerLink={`/historial/${idH}`} color="medium" >
            ← Volver al Historial
          </IonButton>
        </div>

        <IonGrid>
          {/* Fila 1 */}
          <IonRow>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Nombre Mascota</IonLabel>
                <IonInput name="nombreMascota" value={formData.nombreMascota} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Raza</IonLabel>
                <IonInput name="raza" value={formData.raza} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Especie</IonLabel>
                <IonInput name="especie" value={formData.especie} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Fecha Nacimiento</IonLabel>
                <IonButton id="fechaNacimiento" onClick={() => setOpenPicker('fechaNacimiento')} expand="block">
                  Seleccionar Fecha
                </IonButton>
                {formData.fechaNacimiento && (
                  <IonLabel>{new Date(formData.fechaNacimiento).toLocaleDateString()}</IonLabel>
                )}
              </IonItem>
              <IonPopover
                trigger="fechaNacimiento"
                isOpen={openPicker === 'fechaNacimiento'}
                onDidDismiss={() => setOpenPicker('')}
              >
                <IonDatetime presentation="date" onIonChange={(e) => handleDateChange('fechaNacimiento', e)} />
              </IonPopover>
            </IonCol>
          </IonRow>

          {/* Fila 2 */}
          <IonRow>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Sexo</IonLabel>
                <IonSelect name="sexo" value={formData.sexo} onIonChange={handleInputChange}>
                  <IonSelectOption value="Macho">Macho</IonSelectOption>
                  <IonSelectOption value="Hembra">Hembra</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Nombre Dueño</IonLabel>
                <IonInput name="nombreDueno" value={formData.nombreDueno} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Carnet Identidad</IonLabel>
                <IonInput name="carnetIdentidad" value={formData.carnetIdentidad} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel position="stacked">Teléfono</IonLabel>
                <IonInput name="telefono" value={formData.telefono} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 3 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Dirección</IonLabel>
                <IonInput name="direccion" value={formData.direccion} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 4 */}
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Peso (kg)</IonLabel>
                <IonInput name="peso" type="number" value={formData.peso} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel>Castrado</IonLabel>
                <IonCheckbox
                  checked={formData.castrado}
                  onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)}
                />
              </IonItem>
            </IonCol>
            <IonCol size="3">
              <IonItem>
                <IonLabel>Esterilizado</IonLabel>
                <IonCheckbox
                  checked={formData.esterilizado}
                  onIonChange={(e) => handleCheckboxChange('esterilizado', e.detail.checked)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 5 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Seña Particular</IonLabel>
                <IonTextarea name="seniaParticular" value={formData.seniaParticular} onIonChange={handleInputChange} rows={2} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 6 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Anamnesis</IonLabel>
                <IonTextarea name="anamnesis" value={formData.anamnesis} onIonChange={handleInputChange} rows={3} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 7 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Síntomas y Signos</IonLabel>
                <IonTextarea name="sintomasSignos" value={formData.sintomasSignos} onIonChange={handleInputChange} rows={3} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 8 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Tratamiento</IonLabel>
                <IonTextarea name="tratamiento" value={formData.tratamiento} onIonChange={handleInputChange} rows={3} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 9 */}
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel position="stacked">Diagnóstico</IonLabel>
                <IonTextarea name="diagnostico" value={formData.diagnostico} onIonChange={handleInputChange} rows={3} />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 10 */}
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Doctor Atendió</IonLabel>
                <IonInput name="doctorAtendio" value={formData.doctorAtendio} onIonChange={handleInputChange} />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Cita</IonLabel>
                <IonButton id="cita" onClick={() => setOpenPicker('cita')} expand="block">
                  Seleccionar Cita
                </IonButton>
                {formData.cita && <IonLabel>{new Date(formData.cita).toLocaleString()}</IonLabel>}
              </IonItem>
              <IonPopover
                trigger="cita"
                isOpen={openPicker === 'cita'}
                onDidDismiss={() => setOpenPicker('')}
              >
                <IonDatetime presentation="date-time" onIonChange={(e) => handleDateChange('cita', e)} />
              </IonPopover>
            </IonCol>
          </IonRow>

          {/* Fila 11 */}
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Fecha Historial</IonLabel>
                <IonButton id="fechaHistorial" onClick={() => setOpenPicker('fechaHistorial')} expand="block">
                  Seleccionar Fecha
                </IonButton>
                {formData.fechaHistorial && (
                  <IonLabel>{new Date(formData.fechaHistorial).toLocaleString()}</IonLabel>
                )}
              </IonItem>
              <IonPopover
                trigger="fechaHistorial"
                isOpen={openPicker === 'fechaHistorial'}
                onDidDismiss={() => setOpenPicker('')}
              >
                <IonDatetime presentation="date-time" onIonChange={(e) => handleDateChange('fechaHistorial', e)} />
              </IonPopover>
            </IonCol>
          </IonRow>
        </IonGrid>


        <IonRow className="ion-margin-top" justify-content-center>
          <IonCol size="6" className="flex justify-center">
            <IonButton expand="block" color="success" onClick={handleSubmit}>
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              Guardar
            </IonButton>
          </IonCol>
          <IonCol size="6" className="flex justify-center">
            <IonButton expand="block" color="medium" onClick={() => setFormData(initialForm)}>
              Limpiar
            </IonButton>
          </IonCol>
        </IonRow>

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

export default Tab3;