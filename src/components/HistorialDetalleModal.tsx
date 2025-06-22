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
    receta: string;
    recomendacion: string;
  };
}

const calculateAge = (birthDateStr: string): string => {
  if (!birthDateStr) return '-';
  const birthDate = new Date(birthDateStr);
  const now = new Date();

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0 && months <= 0) return 'Recién nacido';
  if (years === 0) return `${months} mes(es)`;
  if (months === 0) return `${years} año(s)`;
  return `${years} año(s) y ${months} mes(es)`;
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString() : '-';

const renderSection = (label: string, value?: string) => (
  <React.Fragment key={label}>
    <tr>
      <td
        colSpan={6}
        className="bg-purple-50 text-purple-700 font-semibold text-sm px-4 py-2 md:px-6 md:py-3 border-t border-b"
      >
        {label}
      </td>
    </tr>
    <tr>
      <td colSpan={6} className="text-gray-800 text-sm md:text-base px-4 py-2 md:px-6 md:py-4 border-b whitespace-pre-wrap">
        {value || <i className="text-gray-400">No especificado</i>}
      </td>
    </tr>
  </React.Fragment>
);

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
          <IonTitle className="text-base md:text-xl font-semibold tracking-wide">
            Detalle Historial
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} className="text-white" aria-label="Cerrar modal">
              <IonIcon icon={close} className="text-xl" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="p-3 md:p-6 max-h-[85vh] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border-collapse">
            <tbody>
              {/* Fila 1: Datos principales */}
              <tr className="bg-purple-100 text-purple-800 font-semibold text-xs md:text-sm uppercase tracking-wider">
                <td className="border px-2 md:px-5 py-2 md:py-3 rounded-tl-lg">Nombre Mascota</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Raza</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Especie</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Fecha Nacimiento</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Sexo</td>
                <td className="border px-2 md:px-5 py-2 md:py-3 rounded-tr-lg">Nombre Dueño</td>
              </tr>
              <tr className="text-center text-gray-700 text-sm md:text-base">
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.nombreMascota}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.raza}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.especie}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{calculateAge(historialDetalle.fechaNacimiento)}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.sexo}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.nombreDueno}</td>
              </tr>

              {/* Fila 2: Datos secundarios */}
              <tr className="bg-purple-100 text-purple-800 font-semibold text-xs md:text-sm uppercase tracking-wider">
                <td className="border px-2 md:px-5 py-2 md:py-3 rounded-bl-lg">Carnet Identidad</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Teléfono</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Dirección</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Peso</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Castrado</td>
                <td className="border px-2 md:px-5 py-2 md:py-3 rounded-br-lg">Esterilizado</td>
              </tr>
              <tr className="text-center text-gray-700 text-sm md:text-base">
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.carnetIdentidad}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.telefono}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.direccion}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.peso}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.castrado ? 'Sí' : 'No'}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.esterilizado ? 'Sí' : 'No'}</td>
              </tr>

              {/* Secciones dinámicas */}
              {[
                ['Seña Particular', historialDetalle.seniaParticular],
                ['Anamnesis', historialDetalle.anamnesis],
                ['Síntomas/Signos', historialDetalle.sintomasSignos],
                ['Tratamiento', historialDetalle.tratamiento],
                ['Diagnóstico', historialDetalle.diagnostico],
                ['Receta', historialDetalle.receta],
                ['Recomendación', historialDetalle.recomendacion],
              ].map(([label, value]) => renderSection(label, value))}

              {/* Última fila: cita, doctor, fecha historial */}
              <tr className="bg-purple-100 text-purple-800 font-semibold text-xs md:text-sm uppercase tracking-wider text-center">
                <td className="border px-2 md:px-5 py-2 md:py-3 rounded-bl-lg">Cita</td>
                <td className="border px-2 md:px-5 py-2 md:py-3">Doctor Atendió</td>
                <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}>
                  Fecha Historial
                </td>
                <td className="border px-2 md:px-5 py-2 md:py-3" colSpan={2}></td>
              </tr>
              <tr className="text-center text-gray-700 text-sm md:text-base">
                <td className="border px-2 md:px-5 py-2 md:py-4">{formatDateTime(historialDetalle.cita)}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4">{historialDetalle.doctorAtendio || '-'}</td>
                <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}>
                  {formatDate(historialDetalle.fechaHistorial)}
                </td>
                <td className="border px-2 md:px-5 py-2 md:py-4" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default HistorialDetalleModal;
