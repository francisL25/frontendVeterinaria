import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonToast,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HistorialContext } from '../context/HistorialContext';
import { useIonRouter } from '@ionic/react';
import api from '../services/api';
import { searchOutline } from 'ionicons/icons';
import UserMenu from '../components/UserMenu';

interface Historial {
  id: number;
  nombreMascota: string;
  fechaNacimiento: string;
  nombreDueno: string;
  carnetIdentidad: string;
  telefono: string;
  direccion: string;
}

const Tab1: React.FC = () => {
  const { refetchFlag } = useContext(HistorialContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  const router = useIonRouter();

  // Función para mostrar toast
  const showToastMessage = useCallback((message: string, color: 'success' | 'danger' | 'warning' = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  }, []);

  // Función para obtener todos los historiales
  const fetchHistoriales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/historial');
      setHistoriales(response.data);
    } catch (error: any) {
      console.error('Error al cargar historiales:', error);
      showToastMessage('Error al cargar historiales');
    } finally {
      setLoading(false);
    }
  }, [showToastMessage]);

  // Función para buscar historiales
  const searchHistoriales = useCallback(async () => {
    if (searchTerm.trim() === '') {
      fetchHistoriales();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/historial/search', {
        params: { texto: searchTerm.trim() },
      });
      setHistoriales(response.data);
    } catch (error: any) {
      console.error('Error al buscar historiales:', error);
      showToastMessage('Error al buscar historiales');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchHistoriales, showToastMessage]);

  // Efecto para refetch cuando cambia la bandera
  useEffect(() => {
    fetchHistoriales();
  }, [refetchFlag, fetchHistoriales]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchHistoriales();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchHistoriales]);

  // Función para navegar al detalle
  const handleVerHistorial = useCallback((historialId: number) => {
    router.push(`/historial/${historialId}`, 'forward');
  }, [router]);

  // Función para formatear fecha
  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Historiales" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="p-4">
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
          {/* Botón Agregar */}
          <IonButton
            size="default"
            color="tertiary"
            onClick={() => router.push('/tabs/tab2', 'forward')}
            className="w-full md:w-auto min-w-fit"
          >
            + Agregar Historial Nuevo
          </IonButton>

          {/* Barra de búsqueda */}
          <div className="flex items-center w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 gap-2 border border-gray-300">
            <IonIcon icon={searchOutline} className="text-gray-500 text-xl flex-shrink-0" />
            <IonInput
              placeholder="Buscar por nombre de mascota, dueño, C.I..."
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              className="w-full text-base"
              clearInput
            />
          </div>
        </div>

        {/* Tabla con loading */}
        <div className="overflow-auto h-[75vh] border rounded-lg shadow-md relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <IonSpinner name="crescent" />
            </div>
          )}

          <table className="min-w-full text-sm text-left">
            <thead className="bg-purple-700 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Nombre Mascota</th>
                <th className="px-4 py-2">Fecha Nac.</th>
                <th className="px-4 py-2">Nombre Dueño</th>
                <th className="px-4 py-2">C.I.</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Dirección</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {historiales.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay historiales registrados'}
                  </td>
                </tr>
              ) : (
                historiales.map((historial, index) => (
                  <tr key={historial.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{historial.nombreMascota || 'N/A'}</td>
                    <td className="px-4 py-2">{formatDate(historial.fechaNacimiento)}</td>
                    <td className="px-4 py-2">{historial.nombreDueno || 'N/A'}</td>
                    <td className="px-4 py-2">{historial.carnetIdentidad || 'N/A'}</td>
                    <td className="px-4 py-2">{historial.telefono || 'N/A'}</td>
                    <td className="px-4 py-2 max-w-xs truncate" title={historial.direccion}>
                      {historial.direccion || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <IonButton
                        size="small"
                        fill="solid"
                        color="primary"
                        onClick={() => handleVerHistorial(historial.id)}
                      >
                        Ver
                      </IonButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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