import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonToast,
    IonIcon,
    IonSpinner,
    IonButton,
} from '@ionic/react';
import { useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { HistorialContext } from '../context/HistorialContext';
import { useIonRouter } from '@ionic/react';
import api from '../services/api';
import { searchOutline } from 'ionicons/icons';
import UserMenu from '../components/UserMenu';
import ProductoModal from '../components/ProductoModal';
import AgregarProductoModal from '../components/AgregarProductoModal';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import BackButton from '../components/BackButton';

dayjs.locale('es');
dayjs.extend(duration);
dayjs.extend(relativeTime);

interface Producto {
    id: number;
    nombre: string;
    fecha_vencimiento: string;
    precio_unitario: number;
    stock: number;
}

type ModalType = 'vender' | 'ventas' | 'ingresos';
type ToastColor = 'success' | 'danger' | 'warning';

const ProductosPage: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { refetchFlag } = useContext(HistorialContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [initialLoading, setInitialLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastColor, setToastColor] = useState<ToastColor>('danger');
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useIonRouter();
    const [selectedOptionId, setSelectedOptionId] = useState<{ [key: number]: string }>({});

    const totalPages = Math.ceil(productos.length / itemsPerPage);
    const paginatedProductos = productos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const showToastMessage = useCallback((message: string, color: ToastColor = 'danger') => {
        setToastMessage(message);
        setToastColor(color);
        setShowToast(true);
    }, []);
    const { id } = useParams<{ id: string }>();
    console.log('Grupo ID desde query params:', id);

    const fetchProductos = useCallback(async () => {
        try {
            setInitialLoading(true);
            const response = await api.get('/productos', {
                params: {
                    id_grupo: id // cambia 3 por el valor dinámico que necesites
                }
            });
            console.log('Productos cargados:', response.data);
            setProductos(response.data);
        } catch (error: any) {
            console.error('Error al cargar productos:', error);
            const errorMessage = error.response?.data?.message || 'Error al cargar productos';
            showToastMessage(errorMessage);
        } finally {
            setInitialLoading(false);
        }
    }, [showToastMessage]);

    const searchProductos = useCallback(async () => {
        if (searchTerm.trim() === '') {
            fetchProductos();
            return;
        }
        try {
            setSearchLoading(true);
            const response = await api.get('/productos/buscar', {
                params: { 
                    texto: searchTerm.trim(),
                    id_grupo: id,
                },
                
            });
            setProductos(response.data);
            setCurrentPage(1); // Resetear página al buscar
        } catch (error: any) {
            console.error('Error al buscar productos:', error);
            const errorMessage = error.response?.data?.message || 'No se encontraron resultados';
            showToastMessage(errorMessage, 'warning');
            setProductos([]); // Limpiar productos si no se encuentran
        } finally {
            setSearchLoading(false);
        }
    }, [searchTerm, fetchProductos, showToastMessage]);

    useEffect(() => {
        fetchProductos();
    }, [refetchFlag, fetchProductos]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchProductos();
        }, 500); // Incrementar delay para mejor UX
        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchProductos]);

    const formatDate = useCallback((dateString: string) => {
        try {
            const date = dayjs(dateString);
            return date.isValid() ? date.format('D MMM YYYY') : 'Fecha inválida';
        } catch (error) {
            return 'Fecha inválida';
        }
    }, []);

    const formatPrice = useCallback((price: number | string | null | undefined) => {
        const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;

        if (parsedPrice === null || parsedPrice === undefined || isNaN(parsedPrice)) {
            return 'Precio inválido';
        }

        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2,
        }).format(parsedPrice);
    }, []);


    const handleOptionChange = useCallback((productoId: number, option: string) => {
        if (option === '') return;

        const producto = productos.find(p => p.id === productoId);
        if (!producto) {
            showToastMessage('Producto no encontrado', 'danger');
            return;
        }

        setSelectedProduct(producto);
        setModalType(option as ModalType);
        setShowModal(true);

        // Resetear el select para que vuelva a "Opciones"
        setSelectedOptionId(prev => ({ ...prev, [productoId]: '' }));
    }, [productos, showToastMessage]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setModalType(null);
        setSelectedProduct(null);
    }, []);

    const handleVentaRegistrada = useCallback(() => {
        fetchProductos();
        showToastMessage('Venta registrada correctamente', 'success');
    }, [fetchProductos, showToastMessage]);

    const handleProductoCreado = useCallback(() => {
        fetchProductos();
        showToastMessage('Producto creado correctamente', 'success');
    }, [fetchProductos, showToastMessage]);

    const getStockColor = useCallback((stock: number) => {
        if (stock > 10) return 'bg-green-100 text-green-800';
        if (stock > 0) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="detalles-arriba">
                    <UserMenu titulo="📦 INVENTARIO" />
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="p-4">
                <div className="mt-6 mb-4 flex justify-between items-center flex-wrap gap-4">
                    {/* Izquierda: BackButton + Botón agregar */}
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <IonButton
                            className="color-boton"
                            onClick={() => setShowAddModal(true)}
                            disabled={initialLoading}
                        >
                            ➕ AGREGAR PRODUCTO
                        </IonButton>
                    </div>

                    {/* Derecha: Buscador */}
                    <div className="flex items-center w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-2 gap-2 border border-gray-300">
                        <IonIcon icon={searchOutline} className="text-gray-500 text-xl flex-shrink-0" />
                        <IonInput
                            placeholder="Buscar por nombre de producto..."
                            value={searchTerm}
                            onIonInput={(e) => setSearchTerm(e.detail.value!)}
                            className="w-full text-base"
                            clearInput
                        />
                        {searchLoading && (
                            <IonSpinner name="crescent" className="text-gray-500" />
                        )}
                    </div>
                </div>


                <div className="overflow-auto h-[75vh] border rounded-lg shadow-md relative">
                    {initialLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
                            <IonSpinner name="crescent" />
                        </div>
                    )}
                    <table className="min-w-full text-sm text-left">
                        <thead style={{ backgroundColor: '#019391' }} className="text-white sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Producto</th>
                                <th className="px-4 py-2">Fecha de Vencimiento</th>
                                <th className="px-4 py-2">Precio Unidad</th>
                                <th className="px-4 py-2">Stock</th>
                                
                                <th className="px-4 py-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProductos.length === 0 && !initialLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay productos registrados'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedProductos.map((producto, index) => (
                                    <tr key={producto.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{producto.nombre || 'N/A'}</td>
                                        <td className="px-4 py-2">{formatDate(producto.fecha_vencimiento)}</td>
                                        <td className="px-4 py-2">{formatPrice(producto.precio_unitario)}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${getStockColor(producto.stock)}`}>
                                                {producto.stock} unidades
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-2 text-center">
                                            <select
                                                style={{ backgroundColor: '#019391' }}
                                                value={selectedOptionId[producto.id] || ''}
                                                onChange={(e) => handleOptionChange(producto.id, e.target.value)}
                                                className="appearance-none bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 hover:bg-teal-700 transition duration-200 ease-in-out w-full max-w-[130px] text-center"
                                                disabled={initialLoading}
                                            >
                                                <option value="" disabled>
                                                    Opciones
                                                </option>
                                                <option value="vender">Vender</option>
                                                <option value="ventas">Ventas</option>
                                                <option value="ingresos">Ingresos</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <IonButton
                            className="color-boton"
                            size="small"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Anterior
                        </IonButton>
                        <span className="text-sm">
                            Página {currentPage} de {totalPages}
                        </span>
                        <IonButton
                            size="small"
                            disabled={currentPage === totalPages}
                            className="color-boton"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Siguiente
                        </IonButton>
                    </div>
                )}

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    color={toastColor}
                />

                <ProductoModal
                    isOpen={showModal}
                    onDidDismiss={handleCloseModal}
                    modalType={modalType}
                    producto={selectedProduct}
                    onVentaRegistrada={handleVentaRegistrada}
                />

                <AgregarProductoModal
                    isOpen={showAddModal}
                    onDidDismiss={() => setShowAddModal(false)}
                    onProductoCreado={handleProductoCreado}
                    idGrupo={id}
                />
            </IonContent>
        </IonPage>
    );
};

export default ProductosPage;