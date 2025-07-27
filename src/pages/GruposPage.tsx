import {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonInput,
    IonToast,
    IonIcon,
    IonSpinner,
    IonButton,
} from '@ionic/react';
import { useState, useEffect, useCallback } from 'react';
import { searchOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import api from '../services/api';
import UserMenu from '../components/UserMenu';
import BackButton from '../components/BackButton';
import AgregarGrupoModal from '../components/AgregarGrupoModal';

interface Grupo {
    id: number;
    nombre: string;
}

type ToastColor = 'success' | 'danger' | 'warning';

const GruposPage: React.FC = () => {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastColor, setToastColor] = useState<ToastColor>('danger');
    
    // Solo usar uno de los dos routers
    const router = useIonRouter();
    // const history = useHistory(); // Comentado - usar solo uno

    const showToastMessage = useCallback((message: string, color: ToastColor = 'danger') => {
        setToastMessage(message);
        setToastColor(color);
        setShowToast(true);
    }, []);

    const fetchGrupos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/grupo');
            if (response.data && Array.isArray(response.data)) {
                setGrupos(response.data);
            } else {
                setGrupos([]);
                showToastMessage('Formato de datos incorrecto', 'warning');
            }
        } catch (error: any) {
            console.error('Error al obtener grupos:', error);
            const errorMessage = error.response?.data?.message || 'Error al obtener grupos';
            showToastMessage(errorMessage);
            setGrupos([]); // Limpiar grupos en caso de error
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    const searchGrupos = useCallback(async () => {
        if (searchTerm.trim() === '') {
            fetchGrupos();
            return;
        }

        try {
            setSearchLoading(true);
            const response = await api.get('/grupo/buscar', {
                params: { texto: searchTerm.trim() },
            });

            if (response.data && Array.isArray(response.data)) {
                setGrupos(response.data);
                if (response.data.length === 0) {
                    showToastMessage('No se encontraron grupos', 'warning');
                }
            } else {
                setGrupos([]);
                showToastMessage('Formato de respuesta incorrecto', 'warning');
            }
        } catch (error: any) {
            console.error('Error al buscar grupos:', error);
            const errorMessage = error.response?.data?.message || 'Error al buscar grupos';
            showToastMessage(errorMessage, 'warning');
            setGrupos([]);
        } finally {
            setSearchLoading(false);
        }
    }, [searchTerm, fetchGrupos, showToastMessage]);

    useEffect(() => {
        fetchGrupos();
    }, [fetchGrupos]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchGrupos();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchGrupos]);

    const handleVerGrupo = (id: number) => {
        // Usar router.push en lugar de history.push para consistencia
        router.push(`/productosPage/${id}`, 'forward');
    };

    const handleInputChange = (e: CustomEvent) => {
        const value = e.detail.value;
        setSearchTerm(value || '');
    };

    const handleAddModalDismiss = () => {
        setShowAddModal(false);
    };

    const handleGrupoCreado = () => {
        setShowAddModal(false);
        fetchGrupos();
        showToastMessage('Grupo creado exitosamente', 'success');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="detalles-arriba">
                    <UserMenu titulo="👥 GRUPOS" />
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="p-4">
                <div className="mt-6 mb-4 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <IonButton 
                            onClick={() => setShowAddModal(true)} 
                            className="color-boton"
                            disabled={loading}
                        >
                            ➕ AGREGAR GRUPO
                        </IonButton>
                        <IonButton
                            onClick={() => router.push('/reporte-mensual', 'forward')}
                            className="color-boton"
                            disabled={loading}
                        >
                            📊 VER REPORTE VENTAS
                        </IonButton>
                    </div>

                    <div className="flex items-center w-full md:w-1/2 bg-white rounded-lg shadow-md px-3 py-2 gap-2 border border-gray-300">
                        <IonIcon icon={searchOutline} className="text-gray-500 text-xl flex-shrink-0" />
                        <IonInput
                            placeholder="Buscar grupo por nombre..."
                            value={searchTerm}
                            onIonInput={handleInputChange}
                            className="w-full text-base"
                            clearInput
                            disabled={loading}
                        />
                        {searchLoading && (
                            <IonSpinner name="crescent" className="text-gray-500" />
                        )}
                    </div>
                </div>

                <div className="overflow-auto border rounded-lg shadow-md relative h-[70vh]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <IonSpinner name="crescent" />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead style={{ backgroundColor: '#019391' }} className="text-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Nombre del Grupo</th>
                                    <th className="px-4 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grupos.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                            {searchTerm.trim()
                                                ? 'No se encontraron grupos'
                                                : 'No hay grupos registrados'}
                                        </td>
                                    </tr>
                                ) : (
                                    grupos.map((grupo, index) => (
                                        <tr key={grupo.id} className="border-b hover:bg-gray-100">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2 font-medium">{grupo.nombre}</td>
                                            <td className="px-4 py-2 text-center">
                                                <IonButton
                                                    className="color-boton"
                                                    onClick={() => handleVerGrupo(grupo.id)}
                                                    disabled={loading}
                                                >
                                                    Ver
                                                </IonButton>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    color={toastColor}
                />

                <AgregarGrupoModal
                    isOpen={showAddModal}
                    onDidDismiss={handleAddModalDismiss}
                    onGrupoCreado={handleGrupoCreado}
                />
            </IonContent>
        </IonPage>
    );
};

export default GruposPage;