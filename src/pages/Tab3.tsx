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
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  const [openPicker, setOpenPicker] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

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
      'diagnostico'
      // Nota: Eliminamos 'fechaHistorial' de los campos obligatorios porque se asignará automáticamente
    ];

    const camposFaltantes = camposObligatorios.filter(
      (campo) => !formData[campo as keyof typeof formData]
    );

    if (camposFaltantes.length > 0) {
      showToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`, 'danger');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataConHistorial = {
        ...formData,
        idH: idH,
        fechaHistorial: new Date().toISOString() // Asigna la fecha y hora actuales en formato ISO
      };

      // Crear nuevo historial por fecha
      const response = await api.post(`/historialFecha/${idH}`, dataConHistorial);

      if (response.status === 201) {
        showToastMessage('Historial por fecha creado correctamente', 'success');
        triggerRefetch();
        setFormData(initialForm);
      }
    } catch (error) {
      console.error('Error al crear historial por fecha:', error);
      showToastMessage('Error al guardar el historial por fecha', 'danger');
    }

    // Segundo try-catch para actualizar historial
    try {
      const dataConHistorial = {
        ...formData,
        idH: idH,
        fechaHistorial: new Date().toISOString() // Asigna la fecha y hora actuales en formato ISO
      };

      const response = await api.put(`/historial/${idH}`, dataConHistorial);

      if (response.status === 200 || response.status === 201) {
        showToastMessage('Historial actualizado correctamente', 'success');
        triggerRefetch();
        setFormData(initialForm);
      }
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      showToastMessage('Error al actualizar el historial', 'danger');
    } finally {
      setIsSubmitting(false);
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
        <div className="mb-6">
          <IonButton
            routerLink={`/historial/${idH}`}
            color="medium"
            fill="solid"
            className="ion-no-padding ion-align-items-center"
          >
            ← Volver al Historial
          </IonButton>
        </div>

        <IonGrid>
          {/* Fila 1 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Nombre Mascota *</IonLabel>
                <IonInput
                  name="nombreMascota"
                  value={formData.nombreMascota}
                  onIonInput={handleInputChange}
                  className="ion-text-wrap"
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Raza *</IonLabel>
                <IonInput
                  name="raza"
                  value={formData.raza}
                  onIonInput={handleInputChange}
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Especie *</IonLabel>
                <IonInput
                  name="especie"
                  value={formData.especie}
                  onIonInput={handleInputChange}
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300 flex flex-col" lines="none">
                <IonLabel className="text-gray-700 font-semibold mb-1">Fecha Nacimiento *</IonLabel>
                <IonButton
                  id="fechaNacimiento"
                  onClick={() => setOpenPicker('fechaNacimiento')}
                  expand="block"
                  fill="outline"
                  size="small"
                  color="primary"
                >
                  Seleccionar Fecha
                </IonButton>
                {formData.fechaNacimiento && (
                  <IonLabel className="ion-text-center ion-margin-top text-sm text-gray-600">
                    {new Date(formData.fechaNacimiento).toLocaleDateString()}
                  </IonLabel>
                )}
              </IonItem>

              <IonPopover
                trigger="fechaNacimiento"
                isOpen={openPicker === 'fechaNacimiento'}
                onDidDismiss={() => setOpenPicker('')}
                alignment="center"
              >
                <IonDatetime
                  presentation="date"
                  onIonChange={(e) => handleDateChange('fechaNacimiento', e)}
                  style={{ padding: 20 }}
                />
              </IonPopover>
            </IonCol>
          </IonRow>

          {/* Fila 2 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Sexo *</IonLabel>
                <IonSelect
                  name="sexo"
                  value={formData.sexo}
                  onIonChange={handleInputChange}
                  interface="popover"
                >
                  <IonSelectOption value="Macho">Macho</IonSelectOption>
                  <IonSelectOption value="Hembra">Hembra</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Nombre Dueño *</IonLabel>
                <IonInput
                  name="nombreDueno"
                  value={formData.nombreDueno}
                  onIonInput={handleInputChange}
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Carnet Identidad *</IonLabel>
                <IonInput
                  name="carnetIdentidad"
                  value={formData.carnetIdentidad}
                  onIonInput={handleInputChange}
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Teléfono *</IonLabel>
                <IonInput
                  name="telefono"
                  value={formData.telefono}
                  onIonInput={handleInputChange}
                  clearInput
                  type="tel"
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 3 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Dirección *</IonLabel>
                <IonInput
                  name="direccion"
                  value={formData.direccion}
                  onIonInput={handleInputChange}
                  clearInput
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 4 */}
          <IonRow className="ion-margin-vertical items-center">
            <IonCol size="12" sizeMd="6">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Peso (kg) *</IonLabel>
                <IonInput
                  name="peso"
                  type="number"
                  value={formData.peso}
                  onIonInput={handleInputChange}
                  clearInput
                  step="0.1"
                  min="0"
                  required
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem lines="none" className="flex items-center gap-2 rounded-md border border-gray-300 p-2">
                <IonCheckbox
                  checked={formData.castrado}
                  onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)}
                  color="primary"
                />
                <IonLabel className="text-gray-700 font-semibold mb-0">Castrado</IonLabel>
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem lines="none" className="flex items-center gap-2 rounded-md border border-gray-300 p-2">
                <IonCheckbox
                  checked={formData.esterilizado}
                  onIonChange={(e) => handleCheckboxChange('esterilizado', e.detail.checked)}
                  color="primary"
                />
                <IonLabel className="text-gray-700 font-semibold mb-0">Esterilizado</IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 5 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Seña Particular</IonLabel>
                <IonTextarea
                  name="seniaParticular"
                  value={formData.seniaParticular}
                  onIonInput={handleInputChange}
                  rows={2}
                  className="ion-text-wrap"
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 6 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Anamnesis *</IonLabel>
                <IonTextarea
                  name="anamnesis"
                  value={formData.anamnesis}
                  onIonInput={handleInputChange}
                  rows={3}
                  className="ion-text-wrap"
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 7 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Síntomas y Signos *</IonLabel>
                <IonTextarea
                  name="sintomasSignos"
                  value={formData.sintomasSignos}
                  onIonInput={handleInputChange}
                  rows={3}
                  className="ion-text-wrap"
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 8 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Tratamiento</IonLabel>
                <IonTextarea
                  name="tratamiento"
                  value={formData.tratamiento}
                  onIonInput={handleInputChange}
                  rows={3}
                  className="ion-text-wrap"
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 9 */}
          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Diagnóstico *</IonLabel>
                <IonTextarea
                  name="diagnostico"
                  value={formData.diagnostico}
                  onIonInput={handleInputChange}
                  rows={3}
                  className="ion-text-wrap"
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 10 */}
          <IonRow className="ion-margin-vertical items-center">
            <IonCol size="12" sizeMd="6">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Doctor Atendió</IonLabel>
                <IonInput
                  name="doctorAtendio"
                  value={formData.doctorAtendio}
                  onIonInput={handleInputChange}
                  clearInput
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonItem className="rounded-md border border-gray-300 flex flex-col" lines="none">
                <IonLabel className="text-gray-700 font-semibold mb-1">Cita</IonLabel>
                <IonButton
                  id="cita"
                  onClick={() => setOpenPicker('cita')}
                  expand="block"
                  fill="outline"
                  size="small"
                  color="primary"
                >
                  Seleccionar Cita
                </IonButton>
                {formData.cita && (
                  <IonLabel className="ion-text-center ion-margin-top text-sm text-gray-600">
                    {new Date(formData.cita).toLocaleString()}
                  </IonLabel>
                )}
              </IonItem>

              <IonPopover
                trigger="cita"
                isOpen={openPicker === 'cita'}
                onDidDismiss={() => setOpenPicker('')}
                alignment="center"
              >
                <IonDatetime
                  presentation="date-time"
                  onIonChange={(e) => handleDateChange('cita', e)}
                  style={{ padding: 20 }}
                />
              </IonPopover>
            </IonCol>
          </IonRow>

          {/* Fila 11 */}


          {/* Botones Guardar y Limpiar */}
          <IonRow className="ion-margin-top ion-justify-content-center">
            <IonCol size="12" sizeMd="6" className="flex justify-center">
              <IonButton
                expand="block"
                color="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ion-padding-horizontal"
              >
                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </IonButton>
            </IonCol>

            <IonCol size="12" sizeMd="6" className="flex justify-center">
              <IonButton
                expand="block"
                color="medium"
                onClick={() => setFormData(initialForm)}
                fill="outline"
                disabled={isSubmitting}
                className="ion-padding-horizontal"
              >
                Limpiar
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;