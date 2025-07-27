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
import BackButton from '../components/BackButton';
import { useContext, useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { checkmarkCircleOutline } from 'ionicons/icons';
import api from '../services/api';
import UserMenu from '../components/UserMenu';

function edadTextoAFecha(edad: string): string {
  // Actualizar regex para manejar solo meses
  const match = edad.match(/(?:(\d+)\s*años?)?\s*(?:(\d+)\s*mes(?:es)?)?/i);
  if (!match) return '';
  
  const anios = parseInt(match[1] ?? '0');
  const meses = parseInt(match[2] ?? '0');

  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - anios);
  fecha.setMonth(fecha.getMonth() - meses);

  return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
}

function calcularEdadStr(fechaNacimientoStr: string): string {
  const hoy = new Date();
  const fechaNacimiento = new Date(fechaNacimientoStr);

  let anios = hoy.getFullYear() - fechaNacimiento.getFullYear();
  let meses = hoy.getMonth() - fechaNacimiento.getMonth();

  // Ajustar si el día actual es menor al día de nacimiento
  if (hoy.getDate() < fechaNacimiento.getDate()) {
    meses--;
  }

  // Si los meses son negativos, ajustar años y meses
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  // Asegurarse de que no tengamos valores negativos
  if (anios < 0) {
    anios = 0;
    // Recalcular meses desde el nacimiento
    const totalMeses = (hoy.getFullYear() - fechaNacimiento.getFullYear()) * 12 + 
                      (hoy.getMonth() - fechaNacimiento.getMonth());
    meses = Math.max(0, totalMeses - (hoy.getDate() < fechaNacimiento.getDate() ? 1 : 0));
  }

  // Formatear el resultado
  if (anios === 0) {
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  } else if (meses === 0) {
    return `${anios} año${anios !== 1 ? 's' : ''}`;
  } else {
    return `${anios} año${anios !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
  }
}

const EditTab: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  const idH = query.get('idH');
  const { id: id } = useParams<{ id: string }>();
  const { nombre } = useContext(AuthContext);
  const { triggerRefetch } = useContext(HistorialContext);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
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
    cita: string | null;  // Aquí permitimos null
    doctorAtendio: string;
    fechaHistorial: string;
    receta: string;
    recomendacion: string;
  }

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
    cita: null,
    doctorAtendio: '',
    fechaHistorial: '',
    receta: '',
    recomendacion: ''
  };

  const [edadAnio, setEdadAnio] = useState<number | null>(null);
  const [edadMes, setEdadMes] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  const [openPicker, setOpenPicker] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datosFijos, setDatosFijos] = useState({});

  useEffect(() => {
    const obtenerUltimoHistorial = async () => {
      try {
        const response = await api.get(`/historialFecha/${id}`);
        const historial = response.data;
        const fecha = calcularEdadStr(historial.fechaNacimiento);
        const camposFijos = {
          nombreMascota: historial.nombreMascota || '',
          raza: historial.raza || '',
          especie: historial.especie || '',
          fechaNacimiento: fecha || '',
          sexo: historial.sexo || '',
          nombreDueno: historial.nombreDueno || '',
          carnetIdentidad: historial.carnetIdentidad || '',
          telefono: historial.telefono || '',
          direccion: historial.direccion || '',
          peso: historial.peso || '',
          castrado: historial.castrado || false,
          esterilizado: historial.esterilizado || false,
          seniaParticular: historial.seniaParticular || '',
          anamnesis: historial.anamnesis || '',
          sintomasSignos: historial.sintomasSignos || '',
          tratamiento: historial.tratamiento || '',
          diagnostico: historial.diagnostico || '',
          cita: historial.cita || null,
          doctorAtendio: historial.doctorAtendio || '',
          fechaHistorial: historial.fechaHistorial || '',
          receta: historial.receta || '',
          recomendacion: historial.recomendacion || ''
        };


        setDatosFijos(camposFijos);
        setFormData(prev => ({ ...prev, ...camposFijos }));
      } catch (error) {
        console.error('No se pudo cargar historial anterior:', error);
        showToastMessage('No se pudo cargar datos anteriores', 'warning');
      }
    };

    if (id) {
      obtenerUltimoHistorial();
    }
  }, [id]);

  useEffect(() => {
    let texto = '';
    if (edadAnio) texto += `${edadAnio} año${edadAnio > 1 ? 's' : ''}`;
    if (edadMes) texto += (texto ? ' ' : '') + `${edadMes} mes${edadMes > 1 ? 'es' : ''}`;

    setFormData(prev => ({
      ...prev,
      fechaNacimiento: texto.trim(),
    }));
  }, [edadAnio, edadMes]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        if (name === 'castrado') {
          return { ...prev, castrado: true, esterilizado: false };
        }
        if (name === 'esterilizado') {
          return { ...prev, castrado: false, esterilizado: true };
        }
      }
      // Si se desmarca, solo actualizamos ese campo
      return { ...prev, [name]: checked };
    });
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
    ];

    const camposFaltantes = camposObligatorios.filter(
      (campo) => !formData[campo as keyof typeof formData]
    );

    if (camposFaltantes.length > 0) {
      showToastMessage(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`, 'danger');
      return;
    }

    // Validar formato de teléfono
    if (!/^(\d{7,8})(\s+\d{7,8})?$/.test(formData.telefono.trim())) {
      showToastMessage('Debe ingresar uno o dos números de teléfono, cada uno con 7 u 8 dígitos', 'danger');
      return false;
    }

    // Validar peso
    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso <= 0) {
      showToastMessage('El peso debe ser un número válido mayor a 0', 'danger');
      return;
    }

    // Validar fecha de cita
    if (formData.cita) {
      console.log(formData.cita);
      const citaDate = new Date(formData.cita);
      const now = new Date();
      if (isNaN(citaDate.getTime())) {
        showToastMessage('La fecha de la cita no es válida', 'danger');
        return;
      }
      if (citaDate < now) {
        showToastMessage('La fecha de la cita no puede ser anterior a la fecha actual', 'danger');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const fechaNacimientoEstimada = edadTextoAFecha(formData.fechaNacimiento);

      const dataConHistorial = {
        ...formData,
        fechaNacimiento: fechaNacimientoEstimada,
        idH: idH
      };

      // Ejecutar ambas operaciones en paralelo
      const [historialFechaResponse, historialResponse] = await Promise.allSettled([
        api.put(`/historialFecha/${id}`, dataConHistorial),
        api.put(`/historial/${idH}`, dataConHistorial)
      ]);

      let hasError = false;
      let successMessages = [];

      // Verificar resultado del historial por fecha
      if (historialFechaResponse.status === 'fulfilled' &&
        historialFechaResponse.value.status === 201) {
        const { historialFechaId } = historialFechaResponse.value.data;

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
            showToastMessage('El historial fue guardado, pero los documentos no se pudieron subir', 'success');
          }
        }

        successMessages.push('Historial por fecha creado correctamente');
      } else {
        console.error('Error al crear historial por fecha:', historialFechaResponse);
        hasError = true;
      }

      // Verificar resultado del historial principal
      if (historialResponse.status === 'fulfilled' &&
        (historialResponse.value.status === 200 || historialResponse.value.status === 201)) {
        successMessages.push('Historial actualizado correctamente');
      } else {
        console.error('Error al actualizar historial:', historialResponse);
        hasError = true;
      }

      if (successMessages.length > 0) {
        showToastMessage(successMessages.join(' y '), 'success');

        // Disparar refetch del contexto
        if (triggerRefetch) {
          triggerRefetch();
        }

        // Redirigir después de un breve delay para mostrar el toast
        setTimeout(() => {
          // Forzar refresh de la página de destino
          window.location.href = `/historial/${idH}`;
        }, 1500);
      }

      if (hasError) {
        showToastMessage('Error parcial al guardar algunos datos', 'warning');
      }

    } catch (error: any) {
      console.error('Error general al guardar:', error);

      // Mostrar mensaje de error más específico
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Error desconocido al guardar';

      showToastMessage(`Error al guardar: ${errorMessage}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Editar Historial" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BackButton />
          <IonItem lines="none" className="rounded-lg border-2 min-w-[200px] p-2">
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
        </div>

        <IonGrid>
          {/* Fila 1 */}
          <IonRow>
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
                <IonLabel className="text-gray-700 font-semibold mb-1">
                  Edad *
                </IonLabel>

                {formData.fechaNacimiento && (
                  <IonLabel className="ion-margin-top text-sm text-gray-600">
                    {formData.fechaNacimiento}
                  </IonLabel>
                )}
              </IonItem>
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
            <IonCol size="12" sizeMd="6">
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
            <IonCol size="12" sizeMd="2">
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

            <IonCol size="12" sizeMd="2">
              <IonItem lines="none" className="flex items-center gap-2 rounded-md border border-gray-300 p-2">
                <IonCheckbox
                  checked={formData.castrado}
                  onIonChange={(e) => handleCheckboxChange('castrado', e.detail.checked)}
                  color="primary"
                />
                <IonLabel className="text-gray-700 font-semibold mb-0">Castrado</IonLabel>
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="2">
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

          {/* Fila 4 */}
          <IonRow className="ion-margin-vertical items-center">

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

          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Receta *</IonLabel>
                <IonTextarea
                  name="receta"
                  value={formData.receta}
                  onIonInput={handleInputChange}
                  rows={3}
                  className="ion-text-wrap"
                  required
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-vertical">
            <IonCol size="12">
              <IonItem className="rounded-md border border-gray-300" lines="none">
                <IonLabel position="stacked" className="text-gray-700 font-semibold">Recomendación *</IonLabel>
                <IonTextarea
                  name="recomendacion"
                  value={formData.recomendacion}
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
                <IonLabel className="text-gray-700 font-semibold mb-1">
                  Cita
                </IonLabel>

                <IonButton
                  id="citaEdit"
                  onClick={() => setOpenPicker('cita')}
                  expand="block"
                  fill="outline"
                  size="small"
                  color="primary"
                >
                  Seleccionar Fecha y Hora
                </IonButton>

                {formData.cita && (
                  <IonLabel className="ion-text-center ion-margin-top text-sm text-gray-600">
                    {new Date(formData.cita).toLocaleString()}
                  </IonLabel>
                )}
              </IonItem>

              <IonPopover
                trigger="citaEdit"
                isOpen={openPicker === 'cita'}
                onDidDismiss={() => setOpenPicker('')}
                alignment="center"
              >
                <IonDatetime
                  presentation="date-time"
                  onIonChange={(e) => handleDateChange('cita', e)}
                  style={{ padding: 20 }}
                  showDefaultButtons={true}
                />
              </IonPopover>
            </IonCol>
          </IonRow>

          {/* Botón Guardar */}
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
          </IonRow>
        </IonGrid>

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

export default EditTab;