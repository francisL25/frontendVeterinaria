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
  IonModal,
  IonText,
} from '@ionic/react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline } from 'ionicons/icons';
import api from '../services/api';
import UserMenu from '../components/UserMenu';
import { useIonRouter } from '@ionic/react';

interface FormData {
  nombreMascota: string;
  raza: string;
  especie: string;
  fechaNacimiento: string;
  sexo: string;
  nombreDueno: string;
  carnetIdentidad: string;
  telefono: string;
  direccion: string;
  peso: string;
  castrado: boolean;
  esterilizado: boolean;
  seniaParticular: string;
  anamnesis: string;
  sintomasSignos: string;
  tratamiento: string;
  diagnostico: string;
  cita: string;
  doctorAtendio: string;
  fechaHistorial: string;
}

const Tab2: React.FC = () => {
  const { nombre } = useContext(AuthContext);
  const { triggerRefetch } = useContext(HistorialContext);
  const router = useIonRouter();

  const initialForm: FormData = {
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

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success' | 'warning'>('danger');
  const [openPicker, setOpenPicker] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: CustomEvent) => {
    const target = e.target as HTMLIonInputElement | HTMLIonSelectElement | HTMLIonTextareaElement;
    const name = target.name;
    const value = target.value as string;

    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: keyof FormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: keyof FormData, e: CustomEvent) => {
    const value = e.detail.value;
    setFormData(prev => ({ ...prev, [name]: value }));
    setOpenPicker('');
  };

  const validateForm = (): string[] => {
    const camposObligatorios: (keyof FormData)[] = [
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
    ];

    return camposObligatorios.filter(
      (campo) => !formData[campo] || formData[campo] === ''
    );
  };

  const showToastMessage = (message: string, color: 'danger' | 'success' | 'warning' = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleSubmit = async () => {
    if (formData.cita) {
  const citaDate = new Date(formData.cita);
  const now = new Date();
  if (isNaN(citaDate.getTime())) {
    showToastMessage('La fecha de la cita no es válida');
    return;
  }
  if (citaDate < now) {
    showToastMessage('La fecha de la cita no puede ser anterior a la fecha actual');
    return;
  }
}
    if (isSubmitting) return;

    const camposFaltantes = validateForm();

    if (camposFaltantes.length > 0) {
      showToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
      return;
    }

    // Validar formato de teléfono (ejemplo básico)
    if (!/^\d{7,8}$/.test(formData.telefono)) {
      showToastMessage('El teléfono debe tener 7 u 8 dígitos numéricos');
      return;
    }

    // Validar peso
    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso <= 0) {
      showToastMessage('El peso debe ser un número válido mayor a 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        peso: peso.toString(), // Asegurar que el peso sea string si la API lo requiere
        fechaHistorial: new Date().toISOString() // Asigna la fecha y hora actuales
      };

      const response = await api.post('/historial', dataToSubmit);

      if (response.status === 201) {
        setShowSuccessModal(true);
        triggerRefetch();
        setFormData(initialForm);
        showToastMessage('Historial guardado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error al guardar el historial:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el historial';
      showToastMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData(initialForm);
    setOpenPicker('');
    showToastMessage('Formulario limpiado', 'warning');
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.push('/tabs/tab1', 'forward');
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        closeSuccessModal();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Agregar Historial Completo" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="mb-4">
          <IonButton routerLink="/tabs/tab1" color="medium" fill="clear">
            ← Volver
          </IonButton>
        </div>

        <IonGrid>
          {/* Fila 1: Información básica de la mascota */}
          <IonRow>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Nombre Mascota *
                </IonLabel>
                <IonInput
                  name="nombreMascota"
                  value={formData.nombreMascota}
                  onIonInput={handleInputChange}
                  placeholder="Ingrese el nombre"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Raza *
                </IonLabel>
                <IonInput
                  name="raza"
                  value={formData.raza}
                  onIonInput={handleInputChange}
                  placeholder="Ingrese la raza"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Especie *
                </IonLabel>
                <IonSelect
                  name="especie"
                  value={formData.especie}
                  onIonChange={handleInputChange}
                  placeholder="Seleccione"
                >
                  <IonSelectOption value="Perro">Perro</IonSelectOption>
                  <IonSelectOption value="Gato">Gato</IonSelectOption>
                  <IonSelectOption value="Ave">Ave</IonSelectOption>
                  <IonSelectOption value="Reptil">Reptil</IonSelectOption>
                  <IonSelectOption value="Otro">Otro</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Fecha Nacimiento *
                </IonLabel>
                <IonButton
                  id="fechaNacimiento"
                  fill="clear"
                  color="dark"
                  onClick={() => setOpenPicker('fechaNacimiento')}
                >
                  {formData.fechaNacimiento ? formatDate(formData.fechaNacimiento) : 'Seleccionar Fecha'}
                </IonButton>
                <IonPopover
                  trigger="fechaNacimiento"
                  isOpen={openPicker === 'fechaNacimiento'}
                  onDidDismiss={() => setOpenPicker('')}
                >
                  <IonDatetime
                    presentation="date"
                    max={new Date().toISOString()}
                    onIonChange={(e) => handleDateChange('fechaNacimiento', e)}
                  />
                </IonPopover>
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Fila 2: Información del dueño */}
          <IonRow>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Sexo *
                </IonLabel>
                <IonSelect
                  name="sexo"
                  value={formData.sexo}
                  onIonChange={handleInputChange}
                  placeholder="Seleccione"
                >
                  <IonSelectOption value="Macho">Macho</IonSelectOption>
                  <IonSelectOption value="Hembra">Hembra</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Nombre Dueño *
                </IonLabel>
                <IonInput
                  name="nombreDueno"
                  value={formData.nombreDueno}
                  onIonInput={handleInputChange}
                  placeholder="Nombre completo"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Carnet Identidad *
                </IonLabel>
                <IonInput
                  name="carnetIdentidad"
                  value={formData.carnetIdentidad}
                  onIonInput={handleInputChange}
                  placeholder="Número de CI"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Teléfono *
                </IonLabel>
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

          {/* Fila 3: Información física */}
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Dirección *
                </IonLabel>
                <IonInput
                  name="direccion"
                  value={formData.direccion}
                  onIonInput={handleInputChange}
                  placeholder="Dirección completa"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="2">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Peso (kg) *
                </IonLabel>
                <IonInput
                  name="peso"
                  value={formData.peso}
                  type="number"
                  step="0.1"
                  min="0"
                  onIonInput={handleInputChange}
                  placeholder="0.0"
                  clearInput
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="2">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel className="font-semibold text-gray-700">Castrado</IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={formData.castrado}
                  onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)}
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="2">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel className="font-semibold text-gray-700">Esterilizado</IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={formData.esterilizado}
                  onIonChange={(e) => handleCheckboxChange('esterilizado', e.detail.checked)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Información clínica */}
          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Seña Particular
                </IonLabel>
                <IonTextarea
                  name="seniaParticular"
                  value={formData.seniaParticular}
                  onIonInput={handleInputChange}
                  rows={2}
                  placeholder="Describe características distintivas..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Anamnesis *
                </IonLabel>
                <IonTextarea
                  name="anamnesis"
                  value={formData.anamnesis}
                  onIonInput={handleInputChange}
                  rows={3}
                  placeholder="Historia clínica y antecedentes..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Síntomas y Signos *
                </IonLabel>
                <IonTextarea
                  name="sintomasSignos"
                  value={formData.sintomasSignos}
                  onIonInput={handleInputChange}
                  rows={3}
                  placeholder="Describe los síntomas observados..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Tratamiento
                </IonLabel>
                <IonTextarea
                  name="tratamiento"
                  value={formData.tratamiento}
                  onIonInput={handleInputChange}
                  rows={3}
                  placeholder="Describe el tratamiento aplicado..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Diagnóstico *
                </IonLabel>
                <IonTextarea
                  name="diagnostico"
                  value={formData.diagnostico}
                  onIonInput={handleInputChange}
                  rows={3}
                  placeholder="Diagnóstico veterinario..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Información adicional */}
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Doctor que Atendió
                </IonLabel>
                <IonInput
                  name="doctorAtendio"
                  value={formData.doctorAtendio}
                  onIonInput={handleInputChange}
                  placeholder="Nombre del veterinario"
                  clearInput
                />
              </IonItem>
            </IonCol>
<IonCol size="12" sizeMd="4">
  <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
    <IonLabel position="stacked" className="font-semibold text-gray-700">
      Cita
    </IonLabel>
    <IonInput
      name="cita"
      value={formData.cita}
      onIonInput={handleInputChange}
      type="datetime-local"
      placeholder="YYYY-MM-DD HH:mm"
      clearInput
    />
  </IonItem>
</IonCol>
            <IonCol size="12" sizeMd="4">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Fecha Historial *
                </IonLabel>
                <IonInput
                  name="fechaHistorial"
                  value={formatDateTime(new Date().toISOString())}
                  readonly
                  placeholder="Fecha actual"
                  className="ion-text-wrap"
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Botones de acción */}
        <IonRow className="ion-margin-top">
          <IonCol size="12" sizeMd="6">
            <IonButton
              expand="block"
              color="success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </IonButton>
          </IonCol>
          <IonCol size="12" sizeMd="6">
            <IonButton
              expand="block"
              color="medium"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              Limpiar
            </IonButton>
          </IonCol>
        </IonRow>

        {/* Modal de confirmación de éxito */}

        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;