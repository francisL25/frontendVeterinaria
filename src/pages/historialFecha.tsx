import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonToast,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';
import HistorialDetalleModal from '../components/HistorialDetalleModal';

interface HistorialFecha {
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
}

const DetallesHistorial: React.FC = () => {
  const { id: idH } = useParams<{ id: string }>();
  const { nombre, logout } = useContext(AuthContext);

  const [historialesFecha, setHistorialesFecha] = useState<HistorialFecha[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const [modalOpen, setModalOpen] = useState(false);
  const [historialSeleccionado, setHistorialSeleccionado] = useState<HistorialFecha | null>(null);

  useEffect(() => {
    if (idH) fetchHistorialFechaByIdH();
  }, [idH]);

  const fetchHistorialFechaByIdH = async () => {
    try {
      const response = await api.get(`/historialFecha/idH/${idH}`);
      setHistorialesFecha(response.data);
    } catch (error: any) {
      console.error(error);
      setToastMessage('Error al cargar los detalles del historial');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const abrirModal = (historial: HistorialFecha) => {
    setHistorialSeleccionado(historial);
    setModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <IonTitle className="detalles-arriba">
            Detalles del Historial #{idH}
          </IonTitle>
          <UserMenu />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="mb-4">
          <IonButton routerLink="/tabs/tab1" color="medium">
            ← Volver
          </IonButton>
        </div>

        {historialesFecha.length > 0 ? (
          <div className="overflow-auto">
            <table className="min-w-full table-auto border border-gray-300 rounded-lg shadow">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Mascota</th>
                  <th className="px-4 py-2 border">Peso</th>
                  <th className="px-4 py-2 border">Diagnóstico</th>
                  <th className="px-4 py-2 border">Doctor</th>
                  <th className="px-4 py-2 border">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historialesFecha.map((h, index) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{index + 1}</td>
                    <td className="px-4 py-2 border">{h.nombreMascota}</td>
                    <td className="px-4 py-2 border text-center">{h.peso} kg</td>
                    <td className="px-4 py-2 border">{h.diagnostico}</td>
                    <td className="px-4 py-2 border">{h.doctorAtendio}</td>
                    <td className="px-4 py-2 border text-center">
                      <IonButton size="small" onClick={() => abrirModal(h)}>
                        {new Date(h.fechaNacimiento).toLocaleDateString()}
                      </IonButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center mt-4 text-gray-600">
            No hay registros disponibles.
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />

        {historialSeleccionado && (
          <HistorialDetalleModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            historialDetalle={historialSeleccionado}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default DetallesHistorial;
