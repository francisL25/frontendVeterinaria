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
import CitasMedicasModal from '../components/CitasMedicasModal';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('es');
dayjs.extend(duration);
dayjs.extend(relativeTime);

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
  const [idSearch, setIdSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isSearchingById = !!idSearch;


  const { refetchFlag } = useContext(HistorialContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  const router = useIonRouter();
  const [modalCitasOpen, setModalCitasOpen] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);


  const paginatedHistoriales = historiales; // ya viene paginado del backend

  // Función para mostrar toast
  const showToastMessage = useCallback((message: string, color: 'success' | 'danger' | 'warning' = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  }, []);

  // Función para obtener todos los historiales
  const fetchHistoriales = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        const response = await api.get('/historial', {
          params: { page, limit: itemsPerPage }
        });
        setHistoriales(response.data.items);
        setTotalItems(response.data.total);
      } else {
        const response = await api.get('/historial/search', {
          params: { texto: searchTerm.trim() }
        });
        setHistoriales(response.data);
        setTotalItems(response.data.length);
      }
    } catch (error) {
      // Manejo de error
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, searchTerm]);


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
      showToastMessage('No se encontraron resultados', 'warning');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchHistoriales, showToastMessage]);

  const searchHistorialById = async () => {
    if (!idSearch) return;

    try {
      setLoading(true);

      const response = await api.get(`/historial/${idSearch}`);

      // Mostrar solo el resultado encontrado
      setHistoriales([response.data]);
      setTotalItems(1);
      setCurrentPage(1);

    } catch (error: any) {
      setHistoriales([]);
      setTotalItems(0);
      showToastMessage('Historial no encontrado', 'warning');
    } finally {
      setLoading(false);
    }
  };


  // Efecto para refetch cuando cambia la bandera
  useEffect(() => {
    fetchHistoriales(currentPage);
  }, [currentPage, fetchHistoriales, refetchFlag]);

  useEffect(() => {
    if (!idSearch) {
      fetchHistoriales(1);
    }
  }, [idSearch, fetchHistoriales]);


  // Efecto para búsqueda con debounce
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  // Función para navegar al detalle
  const handleVerHistorial = useCallback((historialId: number) => {
    window.location.href = `/historial/${historialId}`;
  }, []);

  const calculateAge = useCallback((dateString: string): string => {
    const birthDate = dayjs(dateString);
    const now = dayjs();

    if (!birthDate.isValid()) return 'Fecha inválida';

    const years = now.diff(birthDate, 'year');
    const months = now.diff(birthDate.add(years, 'year'), 'month');

    if (years < 0 || months < 0) return 'Fecha inválida';

    let ageString = '';
    if (years > 0) ageString += `${years} año${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (ageString) ageString += ' y ';
      ageString += `${months} mes${months > 1 ? 'es' : ''}`;
    }

    return ageString || '0 meses';
  }, []);

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
          <UserMenu titulo=" 📋 HISTORIALES" />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="p-4">
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
          {/* Botón Agregar */}
          <IonButton
            size="default"
            onClick={() => router.push('/tabs/tab2', 'forward')}
            className="w-full md:w-auto min-w-fit color-boton"
          >
            ➕ Agregar Historial Nuevo
          </IonButton>
          <IonButton
            size="default"
            onClick={() => router.push('/grupos', 'forward')}
            className="w-full md:w-auto min-w-fit color-boton"
          >
            📦 Inventario
          </IonButton>
          <IonButton
            size="default"
            onClick={() => setModalCitasOpen(true)}
            className="w-full md:w-auto min-w-fit color-boton"
          >
            🗓️ Ver Citas Médicas
          </IonButton>
          {/* Barra de búsqueda */}
          <div className="flex items-center w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 gap-2 border border-gray-300">

            <IonIcon icon={searchOutline} className="text-gray-500 text-xl flex-shrink-0" />
            <IonInput
              placeholder="Buscar por nombre de mascota, dueño, C.I..."
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              className="w-full text-base"
              clearInput
            />
          </div>
          <div className="flex items-center w-32 md:w-40 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 gap-2 border border-gray-300">

            <IonInput
              type="number"
              placeholder="Buscar ID"
              value={idSearch}
              onIonInput={(e) => setIdSearch(e.detail.value!)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchHistorialById();
                }
              }}
              clearInput
            />
          </div>
          {/*<IonButton
            className="color-boton"
            onClick={searchHistorialById}
            disabled={!idSearch}
          >
            Buscar ID
          </IonButton>
          /* Botón de búsqueda */}
        </div>

        {/* Tabla con loading */}
        <div className="overflow-auto h-[75vh] border rounded-lg shadow-md relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <IonSpinner name="crescent" />
            </div>
          )}

          <table className="min-w-full text-sm text-left">
            <thead style={{ backgroundColor: '#019391' }} className="text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Nro</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre Mascota</th>
                <th className="px-4 py-2">Edad</th>
                <th className="px-4 py-2">Nombre Dueño</th>
                <th className="px-4 py-2">C.I.</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Dirección</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistoriales.length === 0 && !loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron resultados' : 'No hay historiales registrados'}
                  </td>
                </tr>
              ) : (
                paginatedHistoriales.map((historial, index) => (
                  <tr key={historial.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2 font-mono text-gray-700">
                      {historial.id}
                    </td>
                    <td className="px-4 py-2 font-medium">{historial.nombreMascota || 'N/A'}</td>
                    <td className="px-4 py-2">{calculateAge(historial.fechaNacimiento)}</td>
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
                        className="color-boton"
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
        <div className="flex justify-center items-center gap-2 mt-4">
          <IonButton
            className="color-boton"
            disabled={isSearchingById || currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Anterior
          </IonButton>

          <IonButton
            className="color-boton"
            disabled={isSearchingById || currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Siguiente
          </IonButton>


        </div>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
        {/* Modal de citas médicas */}
        <CitasMedicasModal isOpen={modalCitasOpen} onClose={() => setModalCitasOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;