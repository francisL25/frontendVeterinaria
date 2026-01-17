import {
    IonPage, IonHeader, IonToolbar, IonContent,
    IonSelect, IonSelectOption, IonButton, IonSpinner, IonToast
} from '@ionic/react';
import { useState } from 'react';
import api from '../services/api';
import UserMenu from '../components/UserMenu';
import BackButton from '../components/BackButton';

interface ResultadoVenta {
    producto: string;
    doctor: string;
    nro_vendidos: string;
    total_bs: string;
}

interface ReporteResponse {
    detalle: ResultadoVenta[];
    total_general: string | number;
}

const ReporteMensualPage: React.FC = () => {
    const anioActual = new Date().getFullYear();
    const [tipoBusqueda, setTipoBusqueda] = useState<'dia' | 'semana'>('dia');
    const [dia, setDia] = useState<string>('');
    const [semana, setSemana] = useState<string>('');
    const [mes, setMes] = useState<string>('');
    const [detalle, setDetalle] = useState<ResultadoVenta[]>([]);
    const [totalGeneral, setTotalGeneral] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [rangoSeleccionado, setRangoSeleccionado] = useState<string | null>(null);

    const mostrarError = (mensaje: string) => {
        setToastMessage(mensaje);
        setShowToast(true);
    };

    const limpiarResultados = () => {
        setDetalle([]);
        setTotalGeneral(0);
        setRangoSeleccionado(null);
    };

    const generarDias = (mes: string): number[] => {
        if (!mes) return [];
        const mesNum = parseInt(mes, 10); // Agregar radix
        const ultimoDia = new Date(anioActual, mesNum, 0).getDate();
        return Array.from({ length: ultimoDia }, (_, i) => i + 1);
    };

    const obtenerRangoSemana = (semana: string, mes: string): { inicio: string, fin: string } => {
        const mesNum = parseInt(mes, 10) - 1; // Agregar radix
        const semanaNum = parseInt(semana, 10); // Agregar radix

        // Calcular inicio de la semana
        const inicio = new Date(anioActual, mesNum, 1 + (semanaNum - 1) * 7);
        const fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);

        // Ajustar al último día del mes si es necesario
        const ultimoDiaMes = new Date(anioActual, mesNum + 1, 0);
        if (fin > ultimoDiaMes) {
            fin.setTime(ultimoDiaMes.getTime());
        }

        const toYMD = (d: Date) => d.toISOString().split('T')[0];
        return { inicio: toYMD(inicio), fin: toYMD(fin) };
    };

    const obtenerReporte = async () => {
        // Validación mejorada
        if (!mes) {
            mostrarError('Selecciona un mes.');
            return;
        }

        if (tipoBusqueda === 'dia' && !dia) {
            mostrarError('Selecciona un día.');
            return;
        }

        if (tipoBusqueda === 'semana' && !semana) {
            mostrarError('Selecciona una semana.');
            return;
        }

        try {
            setLoading(true);
            limpiarResultados();

            const params: Record<string, string> = {
                anio: anioActual.toString(),
                mes
            };
            const endpoint = '/ventas/reporte-diario';

            if (tipoBusqueda === 'dia') {
                params.dia = dia;
            } else {
                const { inicio, fin } = obtenerRangoSemana(semana, mes);
                params.inicio = inicio;
                params.fin = fin;
                setRangoSeleccionado(`📅 Semana ${semana}: ${inicio} a ${fin}`);
            }

            const response = await api.get(endpoint, { params, timeout: 30000 });
            const data: ReporteResponse = response.data;

            // Validación más robusta de la respuesta
            if (!data) {
                throw new Error('No se recibió respuesta del servidor');
            }

            if (!Array.isArray(data.detalle)) {
                throw new Error('Formato de respuesta inválido');
            }

            setDetalle(data.detalle);

            // Conversión más segura del total
            let total = 0;
            if (data.total_general !== null && data.total_general !== undefined) {
                if (typeof data.total_general === 'string') {
                    total = parseFloat(data.total_general);
                } else {
                    total = Number(data.total_general);
                }
            }

            setTotalGeneral(isNaN(total) ? 0 : total);

        } catch (error: any) {
            console.error('Error al obtener reporte:', error);

            // Manejo de errores más específico
            let mensajeError = 'Ocurrió un error al obtener el reporte.';

            if (error.response) {
                // Error de respuesta del servidor
                if (error.response.status === 404) {
                    mensajeError = 'No se encontraron datos para el período seleccionado.';
                } else if (error.response.status >= 500) {
                    mensajeError = 'Error del servidor. Intenta nuevamente más tarde.';
                }
            } else if (error.request) {
                // Error de red
                mensajeError = 'Error de conexión. Verifica tu conexión a internet.';
            } else if (error.message) {
                mensajeError = error.message;
            }

            mostrarError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    const handleTipoBusquedaChange = (tipoBusqueda: 'dia' | 'semana') => {
        setTipoBusqueda(tipoBusqueda);
        setDia('');
        setSemana('');
        setRangoSeleccionado(null);
        limpiarResultados(); // Limpiar resultados al cambiar tipo
    };

    const handleMesChange = (mes: string) => {
        setMes(mes);
        setDia('');
        setSemana('');
        setRangoSeleccionado(null);
        limpiarResultados(); // Limpiar resultados al cambiar mes
    };

    // Función para formatear números de manera segura
    const formatearNumero = (valor: string): number => {
        const numero = parseFloat(valor);
        return isNaN(numero) ? 0 : numero;
    };

    // Obtener semanas válidas para el mes seleccionado
    const obtenerSemanasValidas = (mes: string): number[] => {
        if (!mes) return [];
        const mesNum = parseInt(mes, 10) - 1;
        const ultimoDiaMes = new Date(anioActual, mesNum + 1, 0).getDate();
        const semanasMaximas = Math.ceil(ultimoDiaMes / 7);
        return Array.from({ length: Math.min(semanasMaximas, 5) }, (_, i) => i + 1);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="detalles-arriba">
                    <UserMenu titulo={`📊 REPORTE - Año ${anioActual}`} />
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="p-4">
                <div className="mt-6 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">

                    <BackButton />

                    <IonSelect
                        className="w-full"
                        value={tipoBusqueda}
                        onIonChange={e => handleTipoBusquedaChange(e.detail.value)}
                        interface="popover"
                        placeholder="Tipo de búsqueda"
                    >
                        <IonSelectOption value="dia">Por Día</IonSelectOption>
                        <IonSelectOption value="semana">Por Semana</IonSelectOption>
                    </IonSelect>

                    <IonSelect
                        className="w-full"
                        placeholder="Mes"
                        value={mes}
                        onIonChange={(e) => handleMesChange(e.detail.value)}
                        interface="popover"
                    >
                        {Array.from({ length: 12 }, (_, i) => {
                            const mesValue = String(i + 1).padStart(2, '0');
                            const mesNombre = new Date(0, i).toLocaleString('es-BO', { month: 'long' });
                            return (
                                <IonSelectOption key={i} value={mesValue}>
                                    {mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)}
                                </IonSelectOption>
                            );
                        })}
                    </IonSelect>

                    {tipoBusqueda === 'dia' && (
                        <IonSelect
                            className="w-full"
                            placeholder="Día"
                            value={dia}
                            onIonChange={(e) => setDia(e.detail.value)}
                            disabled={!mes}
                            interface="popover"
                        >
                            {generarDias(mes).map(d => (
                                <IonSelectOption key={d} value={String(d).padStart(2, '0')}>
                                    {d}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    )}

                    {tipoBusqueda === 'semana' && (
                        <IonSelect
                            className="w-full"
                            placeholder="Semana"
                            value={semana}
                            onIonChange={(e) => setSemana(e.detail.value)}
                            disabled={!mes}
                            interface="popover"
                        >
                            {obtenerSemanasValidas(mes).map(s => (
                                <IonSelectOption key={s} value={String(s)}>
                                    Semana {s}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    )}

                    <IonButton
                        expand="block"
                        onClick={obtenerReporte}
                        disabled={loading}
                        className="color-boton h-[42px]"
                    >
                        {loading ? <IonSpinner name="crescent" /> : 'Consultar'}
                    </IonButton>

                </div>

                {rangoSeleccionado && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 text-sm font-medium">{rangoSeleccionado}</p>
                    </div>
                )}

                {detalle.length > 0 && (
                    <div className="overflow-auto border rounded-lg shadow-md mt-4">
                        <table className="min-w-full text-sm text-left">
                            <thead style={{ backgroundColor: '#019391' }} className="text-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Producto</th>
                                    <th className="px-4 py-3 font-medium">Doctor</th>
                                    <th className="px-4 py-3 text-right font-medium">Cantidad Vendida</th>
                                    <th className="px-4 py-3 text-right font-medium">Total (Bs)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {detalle.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{item.producto || 'N/A'}</td>
                                        <td className="px-4 py-3">{item.doctor || 'N/A'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {formatearNumero(item.nro_vendidos).toLocaleString('es-BO')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatearNumero(item.total_bs).toLocaleString('es-BO', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                    <td className="px-4 py-3" colSpan={2}>TOTAL GENERAL</td>
                                    <td className="px-4 py-3 text-right">
                                        {detalle.reduce((acc, item) => acc + formatearNumero(item.nro_vendidos), 0).toLocaleString('es-BO')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {totalGeneral.toLocaleString('es-BO', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })} Bs
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && detalle.length === 0 && mes && ((tipoBusqueda === 'dia' && dia) || (tipoBusqueda === 'semana' && semana)) && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No se encontraron datos para el período seleccionado.</p>
                    </div>
                )}

                <IonToast
                    isOpen={showToast}
                    message={toastMessage}
                    duration={3000}
                    onDidDismiss={() => setShowToast(false)}
                    color="danger"
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default ReporteMensualPage;