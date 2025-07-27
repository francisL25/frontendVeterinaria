// 1. PRIMERO: Crear el archivo components/OwnerSearch.tsx con el código del componente optimizado

// 2. SEGUNDO: En tu Tab2.tsx, hacer estos cambios:

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
  IonList,
} from '@ionic/react';
import BackButton from '../components/BackButton';
import OwnerSearch from '../components/OwnerSearch'; // ✅ AGREGAR esta importación
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline, closeOutline, searchOutline, personOutline } from 'ionicons/icons';
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
  cita?: string | null;
  doctorAtendio: string;
  fechaHistorial: string;
  receta: string;
  recomendacion: string;
}


const Tab2: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
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
      // Validar que los valores sean números válidos
      if (isNaN(anios) || isNaN(meses) || anios < 0 || meses < 0) {
        console.warn('Valores de edad inválidos:', { anios, meses });
        return;
      }

      const hoy = new Date();
      let year = hoy.getFullYear() - anios;
      let month = hoy.getMonth() - meses;
      let day = hoy.getDate();

      // Ajustar el mes si es negativo
      while (month < 0) {
        month += 12;
        year--;
      }

      // Crear la fecha de nacimiento
      const fechaNacimiento = new Date(year, month, 1);
      const ultimoDiaDelMes = new Date(year, month + 1, 0).getDate();
      fechaNacimiento.setDate(Math.min(day, ultimoDiaDelMes));

      // Validar que la fecha calculada no sea futura
      if (fechaNacimiento > hoy) {
        console.warn('La fecha calculada es futura, usando fecha actual');
        setFormData((prev) => ({
          ...prev,
          fechaNacimiento: hoy.toISOString(),
        }));
        return;
      }

      console.log('Fecha calculada:', { anios, meses, fecha: fechaNacimiento.toISOString() });

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
    doctorAtendio: nombre || '',
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

  // ✅ AGREGAR esta función para manejar la selección del dueño
  const handleOwnerSelect = useCallback((owner: { nombreDueno: string; carnetIdentidad: string; telefono: string; direccion: string }) => {
    setFormData(prev => ({
      ...prev,
      nombreDueno: owner.nombreDueno,
      carnetIdentidad: owner.carnetIdentidad,
      telefono: owner.telefono,
      direccion: owner.direccion
    }));
  }, []);

  const handleInputChange = useCallback((e: CustomEvent) => {
    try {
      const target = e.target as HTMLIonInputElement | HTMLIonSelectElement | HTMLIonTextareaElement;
      const name = target.name;
      const value = (e.detail as any).value ?? '';

      if (name && value !== undefined) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } catch (error) {
      console.error('Error en handleInputChange:', error);
    }
  }, []);

  const handleCheckboxChange = useCallback((name: keyof FormData, checked: boolean) => {
    try {
      setFormData(prev => {
        if (checked) {
          if (name === 'castrado') {
            return { ...prev, castrado: true, esterilizado: false };
          } else if (name === 'esterilizado') {
            return { ...prev, castrado: false, esterilizado: true };
          }
        }
        return { ...prev, [name]: checked };
      });
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
      'peso'
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
    if (formData.cita && formData.cita !== 'sin cita') {
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

      formData.cita = citaDate.toISOString();
    } else {
      formData.cita = null;
    }

    if (!/^(\d{7,8})(\s+\d{7,8})?$/.test(formData.telefono.trim())) {
      showToastMessage('Debe ingresar uno o dos números de teléfono, cada uno con 7 u 8 dígitos');
      return false;
    }

    if (formData.carnetIdentidad.trim().length < 6) {
      showToastMessage('El carnet de identidad debe tener al menos 6 caracteres');
      return false;
    }

    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso <= 0 || peso > 200) {
      showToastMessage('El peso debe ser un número válido entre 0.1 y 200 kg');
      return false;
    }

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
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setIsLoading(true);

      const camposFaltantes = validateForm();
      if (camposFaltantes.length > 0) {
        showToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }

      if (!validateInputs()) {
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }

      const dataToSubmit = {
        ...formData,
        nombreMascota: formData.nombreMascota.trim(),
        raza: formData.raza.trim(),
        nombreDueno: formData.nombreDueno.trim(),
        carnetIdentidad: formData.carnetIdentidad.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        peso: parseFloat(formData.peso).toString(),
        doctorAtendio: formData.doctorAtendio.trim() || nombre || 'No especificado',
        fechaHistorial: new Date().toISOString(),
        seniaParticular: formData.seniaParticular.trim(),
        anamnesis: formData.anamnesis.trim(),
        sintomasSignos: formData.sintomasSignos.trim(),
        tratamiento: formData.tratamiento.trim(),
        diagnostico: formData.diagnostico.trim(),
        receta: formData.receta.trim(),
        recomendacion: formData.recomendacion.trim()
      };

      const response = await api.post('/historial', dataToSubmit);

      if (response.status === 201 || response.status === 200) {
        const { historialFechaId } = response.data;

        setShowSuccessModal(true);

        if (pdfFiles.length > 0 && historialFechaId) {
          const formDataDocs = new FormData();
          pdfFiles.forEach(file => {
            formDataDocs.append('documentos', file);
          });
          formDataDocs.append('historial_id', historialFechaId);

          try {
            await api.post('/documentos', formDataDocs, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Documentos subidos correctamente');
          } catch (uploadError) {
            console.error('Error al subir los documentos:', uploadError);
            showToastMessage('El historial fue guardado, pero los documentos no se pudieron subir');
          }
        }

        setFormData(initialForm);
        setEdadAnios(undefined);
        setEdadMeses(undefined);
        setPdfFiles([]);

        if (triggerRefetch) {
          triggerRefetch();
        }

        showToastMessage('Historial guardado exitosamente', 'success');
      } else {
        throw new Error(`Respuesta inesperada del servidor: ${response.status}`);
      }
    } catch (error: any) {
  console.error('Error al guardar:', error);

  if (error.response && error.response.status === 409) {
    const mensaje = error.response.data?.message || 'Ya existe un historial con esa mascota y dueño';
    showToastMessage(mensaje, 'danger');
  } else {
    showToastMessage('Error al guardar el historial', 'danger');
  }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [isSubmitting, validateForm, validateInputs, formData, nombre, triggerRefetch, initialForm, showToastMessage, pdfFiles]);

const handleClearForm = useCallback(() => {
  try {
    setFormData(initialForm);
    setEdadAnios(undefined); // Cambiar a undefined en lugar de 0
    setEdadMeses(undefined); // Cambiar a undefined en lugar de 0
    setPdfFiles([]);
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
        {/* Contenedor principal en una sola fila */}
        <div
          className="flex flex-wrap gap-4 items-start mb-4"
          style={{ alignItems: 'flex-start' }}
        >
          <BackButton />

          {/* Subir documentos PDF */}
          <IonItem lines="none" className="rounded-lg border-2 flex-0.5 min-w-[200px] p-2">
            <IonLabel position="stacked">Subir documentos (PDF)</IonLabel>
            <input
              name="documentos"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const fileArray = Array.from(files);
                  console.log('Archivos seleccionados:', fileArray);
                  setPdfFiles(fileArray);
                }
              }}
              style={{ marginTop: '8px', display: 'block' }}
            />
          </IonItem>

          {/* ✅ REEMPLAZAR toda la sección de búsqueda anterior con esto: */}
          <OwnerSearch
            onOwnerSelect={handleOwnerSelect}
            onError={(message) => showToastMessage(message, 'danger')}
            onSuccess={(message) => showToastMessage(message, 'success')}
            disabled={isSubmitting}
          />
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
      style={{ justifyContent: 'flex-start', textAlign: 'left' }}
    >
      {formData.fechaNacimiento
        ? `${formatDate(formData.fechaNacimiento)} ${
            edadAnios !== undefined && edadMeses !== undefined
              ? `(${edadAnios}a ${edadMeses}m)`
              : ''
          }`
        : 'Seleccionar Edad'}
    </IonButton>

    <IonPopover
      trigger="edadButton"
      isOpen={openPicker === 'fechaNacimiento'}
      onDidDismiss={() => setOpenPicker('')}
      alignment="center"
    >
      <div className="p-4 min-w-[280px]">
        <IonLabel className="block mb-3 font-bold text-center">
          Selecciona Edad Aproximada
        </IonLabel>

        <div className="space-y-3">
          <div>
            <IonLabel className="block mb-1 text-sm font-medium">Años:</IonLabel>
            <IonSelect
              interface="popover"
              placeholder="Seleccionar años"
              value={edadAnios}
              onIonChange={(e) => {
                const anios = parseInt(e.detail.value, 10);
                console.log('Años seleccionados:', anios);
                
                if (!isNaN(anios) && anios >= 0) {
                  setEdadAnios(anios);
                  // Solo calcular si también tenemos meses válidos
                  const mesesActuales = edadMeses || 0;
                  calcularFechaDesdeEdad(anios, mesesActuales);
                } else {
                  console.warn('Valor de años inválido:', anios);
                }
              }}
            >
              {Array.from({ length: 31 }, (_, i) => (
                <IonSelectOption key={i} value={i}>
                  {i} {i === 1 ? 'año' : 'años'}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          <div>
            <IonLabel className="block mb-1 text-sm font-medium">Meses:</IonLabel>
            <IonSelect
              interface="popover"
              placeholder="Seleccionar meses"
              value={edadMeses}
              onIonChange={(e) => {
                const meses = parseInt(e.detail.value, 10);
                console.log('Meses seleccionados:', meses);
                
                if (!isNaN(meses) && meses >= 0 && meses < 12) {
                  setEdadMeses(meses);
                  // Solo calcular si también tenemos años válidos
                  const aniosActuales = edadAnios || 0;
                  calcularFechaDesdeEdad(aniosActuales, meses);
                } else {
                  console.warn('Valor de meses inválido:', meses);
                }
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <IonSelectOption key={i} value={i}>
                  {i} {i === 1 ? 'mes' : 'meses'}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <IonButton
            expand="block"
            size="small"
            fill="clear"
            color="primary"
            onClick={() => {
              setEdadAnios(0);
              setEdadMeses(0);
              setFormData(prev => ({ ...prev, fechaNacimiento: '' }));
            }}
          >
            Limpiar Selección
          </IonButton>
        </div>

        {formData.fechaNacimiento && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-center">
            <strong>Fecha calculada:</strong><br />
            {formatDate(formData.fechaNacimiento)}
          </div>
        )}
      </div>
    </IonPopover>
  </IonItem>
</IonCol>
          </IonRow>

          {/* Fila 2: Información del dueño */}
          <IonRow>
            <IonCol size="12" sizeMd="3">
              <IonItem className="rounded-lg border border-gray-300 shadow-sm" lines="none">
                <IonLabel position="stacked" className="font-semibold text-gray-700">Sexo *</IonLabel>
                <IonSelect
                  name="sexo"
                  value={formData.sexo}
                  onIonChange={handleInputChange}
                  placeholder="Seleccione"
                  interface="popover"
                  className="text-left"
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
                  clearInput
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
          duration={2000}
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