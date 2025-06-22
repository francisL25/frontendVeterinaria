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
  IonLoading,
} from '@ionic/react';
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline, closeOutline } from 'ionicons/icons';
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
  receta: string;
  recomendacion: string;
}

const Tab2: React.FC = () => {
  const [edadAnios, setEdadAnios] = useState<number | undefined>(undefined);
  const [edadMeses, setEdadMeses] = useState<number | undefined>(undefined);

  // Contextos con validación
  const authContext = useContext(AuthContext);
  const historialContext = useContext(HistorialContext);
  const router = useIonRouter();

  // Validar contextos
  if (!authContext || !historialContext) {
    console.error('Contextos no disponibles');
    return (
      <IonPage>
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonText color="danger">
              <h2>Error: Contextos no disponibles</h2>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { nombre } = authContext;
  const { triggerRefetch } = historialContext;

  const calcularFechaDesdeEdad = useCallback((anios: number, meses: number) => {
    try {
      const hoy = new Date();

      // Copia del año, mes y día actuales
      let year = hoy.getFullYear() - anios;
      let month = hoy.getMonth() - meses;
      let day = hoy.getDate();

      // Ajustar año y mes si el mes resultante es negativo
      while (month < 0) {
        month += 12;
        year--;
      }

      // Evitar fechas inválidas como el 31 de febrero
      const fechaNacimiento = new Date(year, month, 1); // Comenzamos con el día 1
      const ultimoDiaDelMes = new Date(year, month + 1, 0).getDate(); // último día de ese mes

      // Establecemos el día más cercano posible (el mínimo entre "hoy.getDate()" y "último día del mes")
      fechaNacimiento.setDate(Math.min(day, ultimoDiaDelMes));

      setFormData((prev) => ({
        ...prev,
        fechaNacimiento: fechaNacimiento.toISOString(),
      }));
    } catch (error) {
      console.error('Error al calcular fecha desde edad:', error);
    }
  }, []);


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
    doctorAtendio: nombre || '', // Usar el nombre del contexto como valor por defecto
    fechaHistorial: '',
    receta: '',
    recomendacion: '',
  };

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success' | 'warning'>('danger');
  const [openPicker, setOpenPicker] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e: CustomEvent) => {
    try {
      const target = e.target as HTMLIonInputElement | HTMLIonSelectElement | HTMLIonTextareaElement;
      const name = target.name;
      const value = target.value as string;

      if (name && value !== undefined) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } catch (error) {
      console.error('Error en handleInputChange:', error);
    }
  }, []);

  const handleCheckboxChange = useCallback((name: keyof FormData, checked: boolean) => {
    try {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } catch (error) {
      console.error('Error en handleCheckboxChange:', error);
    }
  }, []);

  const handleDateChange = useCallback((name: keyof FormData, e: CustomEvent) => {
    try {
      const value = e.detail.value;
      if (value) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      setOpenPicker('');
    } catch (error) {
      console.error('Error en handleDateChange:', error);
    }
  }, []);

  const validateForm = useCallback((): string[] => {
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
      (campo) => {
        const valor = formData[campo];
        return !valor || (typeof valor === 'string' && valor.trim() === '');
      }
    );
  }, [formData]);

  const showToastMessage = useCallback((message: string, color: 'danger' | 'success' | 'warning' = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  }, []);

  const validateInputs = useCallback((): boolean => {
    // Validar fecha de cita si está presente
    if (formData.cita) {
      const citaDate = new Date(formData.cita);
      const now = new Date();

      if (isNaN(citaDate.getTime())) {
        showToastMessage('La fecha de la cita no es válida');
        return false;
      }

      if (citaDate <= now) {
        showToastMessage('La fecha de la cita debe ser posterior a la fecha actual');
        return false;
      }
    }

    // Validar formato de teléfono
    if (!/^(\d{7,8})(\s+\d{7,8})?$/.test(formData.telefono.trim())) {
      showToastMessage('Debe ingresar uno o dos números de teléfono, cada uno con 7 u 8 dígitos');
      return false;
    }


    // Validar carnet de identidad (básico)
    if (formData.carnetIdentidad.trim().length < 6) {
      showToastMessage('El carnet de identidad debe tener al menos 6 caracteres');
      return false;
    }

    // Validar peso
    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso <= 0 || peso > 200) {
      showToastMessage('El peso debe ser un número válido entre 0.1 y 200 kg');
      return false;
    }

    // Validar fecha de nacimiento
    if (formData.fechaNacimiento) {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();

      if (isNaN(fechaNac.getTime())) {
        showToastMessage('La fecha de nacimiento no es válida');
        return false;
      }

      if (fechaNac > hoy) {
        showToastMessage('La fecha de nacimiento no puede ser futura');
        return false;
      }
    }

    return true;
  }, [formData, showToastMessage]);

  const handleSubmit = useCallback(async () => {
    // Prevenir múltiples envíos
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setIsLoading(true);

      // Validar campos obligatorios
      const camposFaltantes = validateForm();
      if (camposFaltantes.length > 0) {
        showToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
        return;
      }

      // Validar inputs específicos
      if (!validateInputs()) {
        return;
      }

      // Preparar datos para envío
      const dataToSubmit = {
        ...formData,
        // Limpiar espacios en blanco
        nombreMascota: formData.nombreMascota.trim(),
        raza: formData.raza.trim(),
        nombreDueno: formData.nombreDueno.trim(),
        carnetIdentidad: formData.carnetIdentidad.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        peso: parseFloat(formData.peso).toString(),
        doctorAtendio: formData.doctorAtendio.trim() || nombre || 'No especificado',
        fechaHistorial: new Date().toISOString(),
        // Limpiar campos de texto largos
        seniaParticular: formData.seniaParticular.trim(),
        anamnesis: formData.anamnesis.trim(),
        sintomasSignos: formData.sintomasSignos.trim(),
        tratamiento: formData.tratamiento.trim(),
        diagnostico: formData.diagnostico.trim(),
        receta: formData.receta.trim(),
        recomendacion: formData.recomendacion.trim()
      };

      // Realizar petición al backend
      const response = await api.post('/historial', dataToSubmit);

      if (response.status === 201 || response.status === 200) {
        setShowSuccessModal(true);

        // Actualizar el contexto si está disponible
        if (triggerRefetch) {
          triggerRefetch();
        }

        // Limpiar formulario
        setFormData(initialForm);
        setEdadAnios(undefined);
        setEdadMeses(undefined);

        showToastMessage('Historial guardado exitosamente', 'success');
      } else {
        throw new Error(`Respuesta inesperada del servidor: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error al guardar el historial:', error);

      let errorMessage = 'Error al guardar el historial';

      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage = data?.message || 'Datos inválidos. Verifique la información ingresada';
        } else if (status === 401) {
          errorMessage = 'No autorizado. Inicie sesión nuevamente';
        } else if (status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción';
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor. Intente nuevamente';
        } else if (status >= 500) {
          errorMessage = 'Error del servidor. Intente más tarde';
        } else {
          errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión. Verifique su conexión a internet';
      } else {
        // Error en la configuración de la petición
        errorMessage = 'Error al procesar la solicitud';
      }

      showToastMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [isSubmitting, validateForm, validateInputs, formData, nombre, triggerRefetch, initialForm, showToastMessage]);

  const handleClearForm = useCallback(() => {
    try {
      setFormData(initialForm);
      setEdadAnios(undefined);
      setEdadMeses(undefined);
      setOpenPicker('');
      showToastMessage('Formulario limpiado', 'warning');
    } catch (error) {
      console.error('Error al limpiar formulario:', error);
    }
  }, [initialForm, showToastMessage]);

  const closeSuccessModal = useCallback(() => {
    try {
      setShowSuccessModal(false);
      router.push('/tabs/tab1', 'forward');
    } catch (error) {
      console.error('Error al cerrar modal y navegar:', error);
    }
  }, [router]);

  // Effect para auto-cerrar modal de éxito
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showSuccessModal) {
      timer = setTimeout(() => {
        closeSuccessModal();
      }, 2500);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showSuccessModal, closeSuccessModal]);

  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('es-ES');
    } catch {
      return '';
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Agregar Historial Completo" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="mb-4">
          <IonButton routerLink="/tabs/tab1" color="medium">
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
                  maxlength={50}
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
                  maxlength={50}
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Especie *
                </IonLabel>
                <IonInput
                  name="especie"
                  value={formData.especie}
                  onIonInput={handleInputChange}
                  clearInput
                  type="text"
                  placeholder="Ingrese la especie (Ej: Perro, Gato, etc.)"
                />
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Edad / Fecha Nacimiento *
                </IonLabel>

                <IonButton
                  id="edadButton"
                  fill="clear"
                  color="dark"
                  onClick={() => setOpenPicker('fechaNacimiento')}
                  disabled={isSubmitting}
                >
                  {formData.fechaNacimiento
                    ? formatDate(formData.fechaNacimiento)
                    : 'Seleccionar Edad'}
                </IonButton>

                <IonPopover
                  trigger="edadButton"
                  isOpen={openPicker === 'fechaNacimiento'}
                  onDidDismiss={() => setOpenPicker('')}
                >
                  <div className="p-4 w-64">
                    <IonLabel>Selecciona Edad Aproximada</IonLabel>

                    <IonSelect
                      placeholder="Años"
                      value={edadAnios}
                      onIonChange={(e) => {
                        const anios = parseInt(e.detail.value, 10);
                        if (!isNaN(anios)) {
                          setEdadAnios(anios);
                          calcularFechaDesdeEdad(anios, edadMeses ?? 0);
                        }
                      }}
                    >
                      {[...Array(51)].map((_, i) => (
                        <IonSelectOption key={i} value={i}>{i} años</IonSelectOption>
                      ))}
                    </IonSelect>

                    <IonSelect
                      placeholder="Meses"
                      value={edadMeses}
                      onIonChange={(e) => {
                        const meses = parseInt(e.detail.value, 10);
                        if (!isNaN(meses)) {
                          setEdadMeses(meses);
                          calcularFechaDesdeEdad(edadAnios ?? 0, meses);
                        }
                      }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <IonSelectOption key={i} value={i}>{i} meses</IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
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
                  maxlength={100}
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
                  maxlength={20}
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
                  maxlength={20}
                  placeholder="Ej: 12345678 o 12345678 87654321"
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
                  maxlength={200}
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
                  min="0.1"
                  max="200"
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
                  maxlength={500}
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
                  maxlength={1000}
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
                  maxlength={1000}
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
                  maxlength={1000}
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
                  maxlength={1000}
                  placeholder="Diagnóstico veterinario..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Receta *
                </IonLabel>
                <IonTextarea
                  name="receta"
                  value={formData.receta}
                  onIonInput={handleInputChange}
                  rows={3}
                  maxlength={1000}
                  placeholder="Receta veterinario..."
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">
                  Recomendación *
                </IonLabel>
                <IonTextarea
                  name="recomendacion"
                  value={formData.recomendacion}
                  onIonInput={handleInputChange}
                  rows={3}
                  maxlength={1000}
                  placeholder="Recomendación veterinario..."
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
                  maxlength={100}
                />
              </IonItem>
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonItem className="rounded-md border border-gray-300 flex flex-col" lines="none">
                <IonLabel className="text-gray-700 font-semibold mb-1">
                  Cita
                </IonLabel>

                <IonButton
                  id="pageA-cita"
                  onClick={() => setOpenPicker('pageA-cita')}
                  expand="block"
                  fill="outline"
                  size="small"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Seleccionar Fecha y Hora
                </IonButton>

                {formData.cita && (
                  <IonLabel className="ion-text-center ion-margin-top text-sm text-gray-600">
                    {formatDateTime(formData.cita)}
                  </IonLabel>
                )}
              </IonItem>

              <IonPopover
                trigger="pageA-cita"
                isOpen={openPicker === 'pageA-cita'}
                onDidDismiss={() => setOpenPicker('')}
                alignment="center"
                side="top"
              >
                <IonDatetime
                  presentation="date-time"
                  onIonChange={(e) => handleDateChange('cita', e)}
                  style={{ padding: 20 }}
                  showDefaultButtons={true}
                  min={new Date().toISOString()}
                />
              </IonPopover>
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
              disabled={isSubmitting || isLoading}
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
              disabled={isSubmitting || isLoading}
            >
              <IonIcon slot="start" icon={closeOutline} />
              Limpiar
            </IonButton>
          </IonCol>
        </IonRow>

        {/* Modal de confirmación de éxito */}
        <IonModal isOpen={showSuccessModal} onDidDismiss={closeSuccessModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Éxito</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
                onClick={closeSuccessModal}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="ion-text-center">
              <IonIcon
                icon={checkmarkCircleOutline}
                style={{ fontSize: '4rem', color: 'var(--ion-color-success)' }}
              />
              <h2>Historial Guardado</h2>
              <p>El historial médico ha sido guardado exitosamente.</p>
              <IonButton
                expand="block"
                color="success"
                onClick={closeSuccessModal}
              >
                Continuar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Loading */}
        <IonLoading
          isOpen={isLoading}
          message="Guardando historial..."
          spinner="crescent"
        />

        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
          position="top"
          buttons={[
            {
              text: 'Cerrar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;