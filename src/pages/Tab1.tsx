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
} from '@ionic/react';
import { useContext, useState, useEffect } from 'react';
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
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState('danger');
  const router = useIonRouter();

  useEffect(() => {
    fetchHistoriales();
  }, [refetchFlag]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchHistoriales();
    } else {
      searchHistoriales();
    }
  }, [searchTerm]);

  const fetchHistoriales = async () => {
    try {
      const response = await api.get('/historial');
      setHistoriales(response.data);
    } catch (error: any) {
      setToastMessage('Error al cargar historiales');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const searchHistoriales = async () => {
    try {
      const response = await api.get('/historial/search', {
        params: { texto: searchTerm },  // Aquí cambio nombreMascota por texto
      });
      setHistoriales(response.data);
    } catch (error: any) {
      setToastMessage('Error al buscar historiales');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <UserMenu titulo="Historiales" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="p-4 bg-gray-50 dark:bg-gray-900">
        {/* Encabezado con botón y búsqueda */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <IonButton
            color="tertiary"
            onClick={() => router.push('/tabs/tab2')}
            className="w-full md:w-auto font-medium"
          >
            + Agregar Historial Nuevo
          </IonButton>

          <div className="flex items-center w-full md:w-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow px-3 py-2 gap-2">
            <IonIcon icon={searchOutline} className="text-gray-500 text-xl" />
            <IonInput
              placeholder="Buscar mascota, dueño, etc."
              value={searchTerm}
              onIonChange={(e) => setSearchTerm(e.detail.value!)}
              debounce={300}
              className="w-full text-sm"
              clearInput
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-auto h-[70vh] rounded-lg shadow-lg border border-gray-300 bg-white dark:bg-gray-800">
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-purple-700 text-white sticky top-0 z-10 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nombre Mascota</th>
                <th className="px-4 py-3">Fecha Nac.</th>
                <th className="px-4 py-3">Nombre Dueño</th>
                <th className="px-4 py-3">C.I.</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {historiales.map((historial, index) => (
                <tr key={historial.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{historial.nombreMascota}</td>
                  <td className="px-4 py-2">
                    {new Date(historial.fechaNacimiento).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{historial.nombreDueno}</td>
                  <td className="px-4 py-2">{historial.carnetIdentidad}</td>
                  <td className="px-4 py-2">{historial.telefono}</td>
                  <td className="px-4 py-2">{historial.direccion}</td>
                  <td className="px-4 py-2 text-center">
                    <IonButton
                      size="small"
                      fill="solid"
                      onClick={() => {
                        window.location.href = `/historial/${historial.id}`;
                      }}
                    >
                      Ver
                    </IonButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Toast */}
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
