import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonToast,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';
import HistorialDetalleModal from '../components/HistorialDetalleModal';
import dayjs from 'dayjs';

interface Documento {
  nombre: string;
}

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
  receta: string;
  recomendacion: string;
  documentos?: Documento[];
}

const DetallesHistorial: React.FC = () => {
  const { id: idH } = useParams<{ id: string }>();
  const [historialesFecha, setHistorialesFecha] = useState<HistorialFecha[]>([]);
  console.log(historialesFecha)
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const [modalOpen, setModalOpen] = useState(false);
  const [historialSeleccionado, setHistorialSeleccionado] = useState<HistorialFecha | null>(null);

  const history = useHistory();

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
    console.log(historial.id);
    setHistorialSeleccionado(historial);
    setModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="detalles-arriba bg-blue-700">
          <UserMenu titulo={`Detalles del Historial #${idH}`} />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-gray-50 dark:bg-gray-900">
        {/* Botones de acción */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <IonButton routerLink="/tabs/tab1" color="medium">
            ← Volver
          </IonButton>
          <IonButton className="color-boton" routerLink={`/tabs/tab3/${idH}`}>
            + Agregar Historial por Fecha
          </IonButton>
        </div>

        {/* Tabla o mensaje */}
        {historialesFecha.length > 0 ? (
          <div className="overflow-auto rounded-lg shadow-lg border border-gray-300 bg-white dark:bg-gray-800">
            <table className="min-w-full text-sm table-fixed">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-2 py-3 border w-[4%]">#</th>
                  <th className="px-2 py-3 border w-[15%]">Mascota</th>
                  <th className="px-2 py-3 border w-[30%]">Tratamiento</th>
                  <th className="px-2 py-3 border w-[30%]">Diagnóstico</th>
                  <th className="px-2 py-3 border w-[12%]">Receta</th>
                  <th className="px-2 py-3 border w-[4%]">Estudios</th>
                  <th className="px-2 py-3 border text-center w-[5%]">👁️‍🗨️Ver</th>
                </tr>
              </thead>
              <tbody>
                {historialesFecha.map((h, index) => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-2 py-2 border text-center w-[4%]">{index + 1}</td>
                    <td className="px-2 py-2 border w-[15%]">
                      {h.nombreMascota}
                    </td>
                    <td className="px-2 py-2 border w-[30%]">
                      <div className="max-h-60 overflow-y-auto break-words text-sm leading-relaxed" title={h.tratamiento}>
                        {h.tratamiento}
                      </div>
                    </td>
                    <td className="px-2 py-2 border w-[30%]">
                      <div className="max-h-60 overflow-y-auto break-words text-sm leading-relaxed" title={h.diagnostico}>
                        {h.diagnostico}
                      </div>
                    </td>
                    <td className="px-2 py-2 border w-[12%]">
                      <div className="max-h-60 overflow-y-auto break-words text-sm leading-relaxed" title={h.receta}>
                        {h.receta}
                      </div>
                    </td>
                    <td className="px-2 py-2 border w-[4%]">
                      <div className="max-h-60 overflow-y-auto text-sm">
                        {h.documentos && h.documentos.length > 0
                          ? h.documentos.map((d, i) => (
                            <div key={i} className="break-words mb-1" title={d.nombre}>
                              {d.nombre}
                            </div>
                          ))
                          : <em className="text-gray-500">No hay</em>
                        }
                      </div>
                    </td>
                    <td className="px-2 py-2 border text-center w-[5%]">
                      <div className="flex flex-col gap-1">
                        <IonButton
                          className="color-boton text-xs"
                          size="small"
                          onClick={() => abrirModal(h)}
                        >
                          {dayjs(h.fechaHistorial).format('D MMM YYYY HH:mm')}
                        </IonButton>
                        <IonButton
                          className="color-boton text-xs"
                          size="small"
                          fill="solid"
                          onClick={() => history.push(`/edit-tab/${h.id}?idH=${idH}`)}
                        >
                          Editar
                        </IonButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center mt-6 text-gray-600 dark:text-gray-300 text-sm">
            No hay registros disponibles.
          </div>
        )}

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />

        {/* Modal */}
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