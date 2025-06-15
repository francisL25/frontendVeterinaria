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
          <IonTitle><h1>Historiales</h1></IonTitle>
          <UserMenu />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
          <IonButton color="primary" onClick={() => router.push('/tabs/tab2')}>
            Agregar Historial
          </IonButton>
          <div className="flex items-center w-full md:w-1/2 gap-2">
            <IonIcon icon={searchOutline} />
            <IonInput
              placeholder="Buscar por nombre de mascota"
              value={searchTerm}
              onIonChange={(e) => setSearchTerm(e.detail.value!)}
              debounce={300} 
              className="w-full"
              clearInput
            />
          </div>
        </div>

        <div className="overflow-auto h-[75vh] border rounded-lg shadow-md">
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
              {historiales.map((historial, index) => (
                <tr key={historial.id} className="border-b hover:bg-gray-100">
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
                    <IonButton size="small" fill="solid"
                    onClick={() => router.push(`/historial/${historial.id}`)}
                    >
                      Ver
                    </IonButton>
                  </td>
                </tr>
              ))}
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
