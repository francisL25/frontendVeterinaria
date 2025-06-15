import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { close } from 'ionicons/icons';

interface HistorialDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  historialDetalle: {
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
  };
}

const HistorialDetalleModal: React.FC<HistorialDetalleProps> = ({
  isOpen,
  onClose,
  historialDetalle,
}) => {
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      backdropDismiss={true}
      className="custom-modal custom-backdrop"
    >
      <IonHeader>
        <IonToolbar className="detalles-arriba">
          <IonTitle className="text-xl font-semibold tracking-wide">
            Detalle Historial
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} className="text-white">
              <IonIcon icon={close} className="text-xl" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-6 max-h-[80vh] overflow-y-auto">
        <table className="w-full border-collapse">
          <tbody>
            {/* Header fila 1 */}
            <tr className="bg-purple-100 text-purple-800 font-semibold text-sm uppercase tracking-wider">
              <td className="border px-5 py-3 rounded-tl-lg">Nombre Mascota</td>
              <td className="border px-5 py-3">Raza</td>
              <td className="border px-5 py-3">Especie</td>
              <td className="border px-5 py-3">Fecha Nacimiento</td>
              <td className="border px-5 py-3">Sexo</td>
              <td className="border px-5 py-3 rounded-tr-lg">Nombre Dueño</td>
            </tr>
            {/* Datos fila 1 */}
            <tr className="text-center text-gray-700 text-base">
              <td className="border px-5 py-4">{historialDetalle.nombreMascota}</td>
              <td className="border px-5 py-4">{historialDetalle.raza}</td>
              <td className="border px-5 py-4">{historialDetalle.especie}</td>
              <td className="border px-5 py-4">
                {new Date(historialDetalle.fechaNacimiento).toLocaleDateString()}
              </td>
              <td className="border px-5 py-4">{historialDetalle.sexo}</td>
              <td className="border px-5 py-4">{historialDetalle.nombreDueno}</td>
            </tr>

            {/* Header fila 2 */}
            <tr className="bg-purple-100 text-purple-800 font-semibold text-sm uppercase tracking-wider">
              <td className="border px-5 py-3 rounded-bl-lg">Carnet Identidad</td>
              <td className="border px-5 py-3">Teléfono</td>
              <td className="border px-5 py-3">Dirección</td>
              <td className="border px-5 py-3">Peso (kg)</td>
              <td className="border px-5 py-3">Castrado</td>
              <td className="border px-5 py-3 rounded-br-lg">Esterilizado</td>
            </tr>
            {/* Datos fila 2 */}
            <tr className="text-center text-gray-700 text-base">
              <td className="border px-5 py-4">{historialDetalle.carnetIdentidad}</td>
              <td className="border px-5 py-4">{historialDetalle.telefono}</td>
              <td className="border px-5 py-4">{historialDetalle.direccion}</td>
              <td className="border px-5 py-4">{historialDetalle.peso}</td>
              <td className="border px-5 py-4">{historialDetalle.castrado ? 'Sí' : 'No'}</td>
              <td className="border px-5 py-4">{historialDetalle.esterilizado ? 'Sí' : 'No'}</td>
            </tr>

            {/* Sections helper function */}
            {[
              { label: 'Seña Particular', value: historialDetalle.seniaParticular },
              { label: 'Anamnesis', value: historialDetalle.anamnesis },
              { label: 'Síntomas/Signos', value: historialDetalle.sintomasSignos },
              { label: 'Tratamiento', value: historialDetalle.tratamiento },
              { label: 'Diagnóstico', value: historialDetalle.diagnostico },
            ].map(({ label, value }) => (
              <React.Fragment key={label}>
                <tr>
                  <td
                    colSpan={6}
                    className="bg-purple-50 text-purple-700 font-semibold text-sm px-6 py-3 border-t border-b"
                  >
                    {label}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-gray-800 px-6 py-4 border-b whitespace-pre-wrap">
                    {value || <i className="text-gray-400">No especificado</i>}
                  </td>
                </tr>
              </React.Fragment>
            ))}

            {/* Última fila: cita, doctor, fecha historial */}
            <tr className="bg-purple-100 text-purple-800 font-semibold text-sm uppercase tracking-wider text-center">
              <td className="border px-5 py-3 rounded-bl-lg">Cita</td>
              <td className="border px-5 py-3">Doctor Atendió</td>
              <td className="border px-5 py-3" colSpan={2}>
                Fecha Historial
              </td>
              <td className="border px-5 py-3" colSpan={2}></td>
            </tr>
            <tr className="text-center text-gray-700 text-base">
              <td className="border px-5 py-4">{historialDetalle.cita || '-'}</td>
              <td className="border px-5 py-4">{historialDetalle.doctorAtendio || '-'}</td>
              <td className="border px-5 py-4" colSpan={2}>
                {historialDetalle.fechaHistorial
                  ? new Date(historialDetalle.fechaHistorial).toLocaleDateString()
                  : '-'}
              </td>
              <td className="border px-5 py-4" colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </IonContent>
    </IonModal>
  );
};

export default HistorialDetalleModal;
