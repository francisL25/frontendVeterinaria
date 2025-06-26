import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonText,
  IonAlert,
} from '@ionic/react';
import { close, documentOutline, downloadOutline, eyeOutline } from 'ionicons/icons';
import api from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
dayjs.locale('es');

interface Documento {
  id: number;
  nombre: string;
  archivoBase64?: string; // Opcional ya que usaremos la ruta de descarga
}

interface HistorialDetalle {
  id: number;
  nombreMascota: string;
  raza: string;
  especie: string;
  fechaNacimiento: string;
  sexo: string;
  nombreDueno: string;
  carnetIdentidad: string;
  telefono: string;
  direccion: string;
  peso: number;
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

interface HistorialDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  historialDetalle: HistorialDetalle;
}

const HistorialDetalleModal: React.FC<HistorialDetalleProps> = ({
  isOpen,
  onClose,
  historialDetalle,
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loadingDocumento, setLoadingDocumento] = useState<number | null>(null);

  const { token } = useContext(AuthContext);
  
  // Función para cargar documentos
  const cargarDocumentos = useCallback(async () => {
    if (!historialDetalle?.id) return;

    setError(null);

    try {
      const { data } = await api.get(`/documentos/historial/${historialDetalle.id}`);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar documentos:', err);
      
      const backendError = err?.response?.data?.error;
      
      if (backendError === 'No se encontraron documentos para este historial') {
        setDocumentos([]);
        setError(null);
      } else {
        const errorMessage = err?.response?.data?.message || 
                           err?.message || 
                           'Error al cargar documentos';
        setError(errorMessage);
      }
    }
  }, [historialDetalle?.id]);

  // Effect para cargar documentos cuando se abre el modal
  useEffect(() => {
    if (isOpen && historialDetalle?.id) {
      cargarDocumentos();
    } else {
      // Reset estado cuando se cierra el modal
      setDocumentos([]);
      setError(null);
      setLoadingDocumento(null);
    }
  }, [isOpen, cargarDocumentos]);

  // Función para calcular edad
const calculateAge = useCallback((birthDateStr: string): string => {
  if (!birthDateStr) return '-';

  const birthDate = dayjs(birthDateStr);
  const now = dayjs();

  if (!birthDate.isValid()) return '-';

  const years = now.diff(birthDate, 'year');
  const months = now.diff(birthDate.add(years, 'year'), 'month');

  if (years < 0 || months < 0) return 'Fecha inválida';
  if (years === 0 && months === 0) return 'Recién nacido';
  if (years === 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
  if (months === 0) return `${years} año${years !== 1 ? 's' : ''}`;

  return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`;
}, []);

  // Función para formatear fecha y hora
  const formatDateTime = useCallback((dateStr: string): string => {
    if (!dateStr) return '-';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  }, []);

  // Función para formatear solo fecha
  const formatDate = useCallback((dateStr: string): string => {
    if (!dateStr) return '-';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  }, []);

  // Función para ver documento PDF usando fetch con Bearer token
  const verDocumento = useCallback(async (doc: Documento) => {
    if (!token) {
      setAlertMessage('Token de autenticación no disponible');
      setShowAlert(true);
      return;
    }

    setLoadingDocumento(doc.id);
    
    try {
      const response = await fetch(`${api.defaults.baseURL}/documentos/ver/${doc.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear URL temporal para el blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        setAlertMessage('No se pudo abrir el documento. Verifique que los pop-ups estén habilitados.');
        setShowAlert(true);
        // Limpiar URL si no se pudo abrir
        URL.revokeObjectURL(blobUrl);
      } else {
        // Limpiar la URL después de un tiempo para liberar memoria
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 30000); // 30 segundos
      }
      
    } catch (error: any) {
      console.error('Error al ver documento:', error);
      setAlertMessage(`Error al abrir el documento: ${error.message}`);
      setShowAlert(true);
    } finally {
      setLoadingDocumento(null);
    }
  }, [token]);

  // Función para descargar documento
  const descargarDocumento = useCallback(async (doc: Documento) => {
    if (!token) {
      setAlertMessage('Token de autenticación no disponible');
      setShowAlert(true);
      return;
    }

    setLoadingDocumento(doc.id);
    
    try {
      const response = await fetch(`${api.defaults.baseURL}/documentos/descargar/${doc.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre.endsWith('.pdf') ? doc.nombre : `${doc.nombre}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Error al descargar documento:', error);
      setAlertMessage(`Error al descargar el documento: ${error.message}`);
      setShowAlert(true);
    } finally {
      setLoadingDocumento(null);
    }
  }, [token]);

  // Función para renderizar secciones de texto largo
  const renderSection = useCallback((label: string, value?: string) => (
    <React.Fragment key={label}>
      <tr>
        <td
          colSpan={6}
          style={{ color: '#019391' }}
          className="bg-purple-50 font-semibold text-sm px-4 py-2 md:px-6 md:py-3 border-t border-b"
        >
          {label}
        </td>
      </tr>
      <tr>
        <td 
          colSpan={6} 
          className="text-gray-800 text-sm md:text-base px-4 py-2 md:px-6 md:py-4 border-b whitespace-pre-wrap"
        >
          {value ? (
            <span>{value}</span>
          ) : (
            <i className="text-gray-400">No especificado</i>
          )}
        </td>
      </tr>
    </React.Fragment>
  ), []);

  // Función para manejar el cierre del modal
  const handleClose = useCallback(() => {
    setError(null);
    setShowAlert(false);
    setLoadingDocumento(null);
    onClose();
  }, [onClose]);

  if (!historialDetalle) {
    return null;
  }

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={handleClose}
        backdropDismiss={true}
        className="custom-modal custom-backdrop"
      >
        <IonHeader>
          <IonToolbar className="detalles-arriba">
            <IonTitle className="text-base md:text-xl font-semibold tracking-wide">
              Detalle Historial - {historialDetalle.nombreMascota}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton 
                onClick={handleClose} 
                className="text-white" 
                aria-label="Cerrar modal"
              >
                <IonIcon icon={close} className="text-xl" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="p-3 md:p-6 max-h-[85vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-collapse shadow-sm">
              <tbody>
                {/* Información de la mascota */}
                <tr style={{ color: '#019391' }} className="bg-purple-100 font-semibold text-xs md:text-sm uppercase tracking-wider">
                  <td className="border px-2 md:px-5 py-2 md:py-3 rounded-tl-lg">Nombre Mascota</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Raza</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Especie</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Edad</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Sexo</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3 rounded-tr-lg">Peso (kg)</td>
                </tr>
                <tr className="text-center text-gray-700 text-sm md:text-base">
                  <td className="border px-2 md:px-5 py-2 md:py-4 font-medium">
                    {historialDetalle.nombreMascota || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.raza || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.especie || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {calculateAge(historialDetalle.fechaNacimiento)}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.sexo || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.peso ? `${historialDetalle.peso} kg` : '-'}
                  </td>
                </tr>

                {/* Información del dueño */}
                <tr style={{ color: '#019391' }} className="bg-purple-100 font-semibold text-xs md:text-sm uppercase tracking-wider">
                  <td className="border px-2 md:px-5 py-2 md:py-3">Dueño</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Carnet</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Teléfono</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}>Dirección</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3">Estado</td>
                </tr>
                <tr className="text-center text-gray-700 text-sm md:text-base">
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.nombreDueno || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.carnetIdentidad || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    {historialDetalle.telefono || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}>
                    {historialDetalle.direccion || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4">
                    <div className="space-y-1">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          historialDetalle.castrado 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {historialDetalle.castrado ? 'Castrado' : 'No castrado'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          historialDetalle.esterilizado 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {historialDetalle.esterilizado ? 'Esterilizado' : 'No esterilizado'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Secciones de texto largo */}
                {[
                  ['Seña Particular', historialDetalle.seniaParticular],
                  ['Anamnesis', historialDetalle.anamnesis],
                  ['Síntomas/Signos', historialDetalle.sintomasSignos],
                  ['Diagnóstico', historialDetalle.diagnostico],
                  ['Tratamiento', historialDetalle.tratamiento],
                  ['Receta', historialDetalle.receta],
                  ['Recomendación', historialDetalle.recomendacion],
                ].map(([label, value]) => renderSection(label, value))}

                {/* Información de la consulta */}
                <tr style={{ color: '#019391' }} className="bg-purple-100 font-semibold text-xs md:text-sm uppercase tracking-wider text-center">
                  <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}>Fecha de Cita</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}>Doctor que Atendió</td>
                  <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}>Fecha del Historial</td>
                </tr>
                <tr className="text-center text-gray-700 text-sm md:text-base">
                  <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}>
                    {formatDateTime(historialDetalle.cita)}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}>
                    {historialDetalle.doctorAtendio || '-'}
                  </td>
                  <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}>
                    {formatDate(historialDetalle.fechaHistorial)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <IonText color="danger" className="block text-center font-medium">
                {error}
              </IonText>
            </div>
          )}

          {/* No documents message */}
          {documentos.length === 0 && !error && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <IonText className="block text-center text-gray-600">
                No hay documentos adjuntos para este historial.
              </IonText>
            </div>
          )}

          {/* Documents section */}
          {documentos.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-purple-700 font-semibold mb-4 flex items-center gap-2">
                <IonIcon icon={documentOutline} />
                Documentos Adjuntos ({documentos.length})
              </h3>
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <IonIcon icon={documentOutline} className="text-blue-600 text-xl" />
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.nombre}</h4>
                        <p className="text-sm text-gray-500">Documento PDF</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <IonButton
                        size="small"
                        fill="outline"
                        onClick={() => verDocumento(doc)}
                        disabled={loadingDocumento === doc.id}
                        className="shrink-0"
                      >
                        <IonIcon icon={eyeOutline} slot="start" />
                        {loadingDocumento === doc.id ? 'Cargando...' : 'Ver'}
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="solid"
                        onClick={() => descargarDocumento(doc)}
                        disabled={loadingDocumento === doc.id}
                        className="shrink-0"
                      >
                        <IonIcon icon={downloadOutline} slot="start" />
                        Descargar
                      </IonButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Alert para errores de documentos */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message={alertMessage}
        buttons={['OK']}
      />
    </>
  );
};

export default HistorialDetalleModal;