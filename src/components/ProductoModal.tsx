import React, { useEffect, useState, useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface Producto {
    id: number;
    nombre: string;
    fecha_vencimiento: string;
    precio_unitario: number;
    stock: number;
}

interface Registro {
    id: number;
    fecha: string;
    salida?: number;
    ingreso?: number;
    precio?: number;
    doctor?: string;
}

interface ProductoModalProps {
    isOpen: boolean;
    onDidDismiss: () => void;
    modalType: 'vender' | 'ventas' | 'ingresos' | null;
    producto: Producto | null;
    usuario?: string;
    onVentaRegistrada?: () => void;
}

interface ToastState {
    show: boolean;
    message: string;
    color: 'success' | 'danger' | 'warning';
}

const ProductoModal: React.FC<ProductoModalProps> = ({
    isOpen,
    onDidDismiss,
    modalType,
    producto,
    onVentaRegistrada
}) => {
    const authContext = useContext(AuthContext);
    const nombre = authContext?.nombre || '';

    const [cantidad, setCantidad] = useState<string>('');
    const [doctor, setDoctor] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', color: 'success' });

    // Estado para ingreso
    const [totalVentas, setTotalVentas] = useState<number>(0);
    const [showIngresoModal, setShowIngresoModal] = useState(false);
    const [ingresoCantidad, setIngresoCantidad] = useState<string>('');
    const [ingresoPrecio, setIngresoPrecio] = useState<string>('');

    const showToast = useCallback((message: string, color: ToastState['color'] = 'success') => {
        setToast({ show: true, message, color });
        setTimeout(() => setToast({ show: false, message: '', color: 'success' }), 3000);
    }, []);

    const clearForm = useCallback(() => {
        setCantidad('');
        setDoctor('');
    }, []);

    const clearIngresoForm = useCallback(() => {
        setIngresoCantidad('');
        setIngresoPrecio('');
    }, []);

    const clearToast = useCallback(() => {
        setToast({ show: false, message: '', color: 'success' });
    }, []);

    const fetchVentas = useCallback(async () => {
        if (!producto) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/ventas/obtenerVentas/${producto.id}`);
            console.log('Ventas obtenidas:', data);
            setRegistros(Array.isArray(data.ventas) ? data.ventas : []);
            setTotalVentas(data.total || 0);
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            showToast('Error al cargar ventas', 'danger');
            setRegistros([]);
            setTotalVentas(0);
        } finally {
            setLoading(false);
        }
    }, [producto, showToast]);

    const fetchIngresos = useCallback(async () => {
        if (!producto) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/ingresos/obtenerIngresos/${producto.id}`);
            setRegistros(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            showToast('Error al cargar ingresos', 'danger');
            setRegistros([]);
        } finally {
            setLoading(false);
        }
    }, [producto, showToast]);

    useEffect(() => {
        if (!isOpen) {
            clearForm();
            clearIngresoForm();
            clearToast();
            setRegistros([]);
            setLoading(false);
            setShowIngresoModal(false);
            setTotalVentas(0);
        }
    }, [isOpen, clearForm, clearIngresoForm, clearToast]);

    useEffect(() => {
        if (!isOpen || !producto) return;
        
        clearToast();
        setRegistros([]);
        
        if (modalType === 'ventas') {
            fetchVentas();
        } else if (modalType === 'ingresos') {
            fetchIngresos();
        } else if (modalType === 'vender') {
            clearForm();
            setDoctor(nombre);
        }
    }, [isOpen, modalType, producto, fetchVentas, fetchIngresos, clearForm, clearToast, nombre]);

    const validateVenta = useCallback((): string | null => {
        if (!producto) return 'Producto no disponible';
        if (!cantidad || cantidad.trim() === '') return 'La cantidad es requerida';
        
        const cantidadNum = parseInt(cantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum <= 0) return 'La cantidad debe ser un número mayor a 0';
        if (cantidadNum > producto.stock) return 'Stock insuficiente';
        
        return null;
    }, [producto, cantidad]);

    const registrarVenta = useCallback(async () => {
        const validationError = validateVenta();
        if (validationError) {
            showToast(validationError, 'danger');
            return;
        }
        if (!producto) return;

        try {
            setLoading(true);
            const body = {
                id_producto: producto.id,
                salida: parseInt(cantidad, 10),
                precio: producto.precio_unitario,
                fecha: new Date().toISOString(),
                doctor: doctor.trim() || undefined,
            };
            
            await api.post(`/ventas/registrarVenta/${producto.id}`, body);
            showToast('Venta registrada con éxito', 'success');
            clearForm();
            onVentaRegistrada?.();
            
            setTimeout(() => {
                onDidDismiss();
            }, 1000);
        } catch (error) {
            console.error('Error al registrar venta:', error);
            showToast('Error al registrar venta', 'danger');
        } finally {
            setLoading(false);
        }
    }, [producto, cantidad, doctor, validateVenta, showToast, clearForm, onVentaRegistrada, onDidDismiss]);

    const validateIngreso = useCallback((): string | null => {
        if (!producto) return 'Producto no disponible';
        if (!ingresoCantidad || ingresoCantidad.trim() === '') return 'La cantidad es requerida';
        
        const cantidadNum = parseInt(ingresoCantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum <= 0) return 'La cantidad debe ser mayor a 0';
        
        return null;
    }, [producto, ingresoCantidad]);

    const registrarIngreso = useCallback(async () => {
        const error = validateIngreso();
        if (error) {
            showToast(error, 'danger');
            return;
        }
        if (!producto) return;

        try {
            setLoading(true);
            const body = {
                id_producto: producto.id,
                ingreso: parseInt(ingresoCantidad, 10),
                fecha: new Date().toISOString(),
                ...(ingresoPrecio && { precio: parseFloat(ingresoPrecio) })
            };
            
            await api.post(`/ingresos/registrarIngreso/${producto.id}`, body);
            showToast('Ingreso registrado con éxito');
            onVentaRegistrada?.();
            
            // Refrescar la lista de ingresos
            await fetchIngresos();
            
            setShowIngresoModal(false);
            clearIngresoForm();
        } catch (error) {
            console.error('Error al registrar ingreso:', error);
            showToast('Error al registrar ingreso', 'danger');
        } finally {
            setLoading(false);
        }
    }, [producto, ingresoCantidad, ingresoPrecio, validateIngreso, showToast, fetchIngresos, clearIngresoForm]);

    const getModalTitle = useCallback((): string => {
        switch (modalType) {
            case 'vender': return 'Vender Producto';
            case 'ventas': return 'Historial de Ventas';
            case 'ingresos': return 'Historial de Ingresos';
            default: return 'Producto';
        }
    }, [modalType]);

    const formatPrice = useCallback((price: number): string => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(price);
    }, []);

    const formatDate = useCallback((dateString: string): string => {
        return dayjs(dateString).format('D MMM YYYY HH:mm');
    }, []);

    const handleCantidadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
            setCantidad(value);
        }
    }, []);

    const handleIngresoCantidadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
            setIngresoCantidad(value);
        }
    }, []);

    const handleIngresoPrecioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
            setIngresoPrecio(value);
        }
    }, []);

    const modalStyles = {
overlay: {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'flex-start', // 👈 lo baja un poco
  justifyContent: 'center',
  zIndex: 2000,              // 👈 asegúrate que esté por encima de header
  padding: '80px 20px 20px'  // 👈 deja espacio arriba
},
        modal: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            width: modalType === 'vender' ? '600px' : modalType === 'ventas' || modalType === 'ingresos' ? '800px' : '600px',
            maxWidth: '95vw'
        },
        header: {
            backgroundColor: '#019391',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        content: {
            padding: '24px'
        },
        card: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden'
        },
        cardHeader: {
            backgroundColor: '#f9fafb',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb'
        },
        cardContent: {
            padding: '16px'
        },
        inputGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            marginBottom: '4px',
            fontWeight: '500',
            fontSize: '14px',
            color: '#374151'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: 'white', // 👈 fuerza fondo blanco
    
        },
        button: {
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        primaryButton: {
            backgroundColor: '#019391',
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            color: '#019391',
            border: '1px solid #019391'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
        },
        spinner: {
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #019391',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            animation: 'spin 1s linear infinite'
        },
        registroItem: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            backgroundColor: '#f9fafb'
        },
        historialContainer: {
            maxHeight: '60vh',
            overflowY: 'auto' as const,
            padding: '4px'
        }
    };

    const toastStyles = {
        position: 'fixed' as const,
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: 1001,
        transform: toast.show ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: toast.color === 'success' ? '#10b981' : toast.color === 'danger' ? '#ef4444' : '#f59e0b'
    };

    const renderVentaForm = () => {
        if (!producto) return null;
        
        const cantidadNum = parseInt(cantidad) || 0;
        const totalPrice = cantidadNum * producto.precio_unitario;

        return (
            <div>
                <div style={modalStyles.card}>
                    <div style={modalStyles.cardHeader}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{producto.nombre}</h3>
                    </div>
                    <div style={modalStyles.cardContent}>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <span><strong>Stock:</strong> {producto.stock}</span>
                            <span><strong>Vencimiento:</strong> {dayjs(producto.fecha_vencimiento).format('D MMM YYYY')}</span>
                        </div>
                    </div>
                </div>

                <div style={modalStyles.inputGroup}>
                    <label style={modalStyles.label}>Cantidad *</label>
                    <input
                        type="number"
                        value={cantidad}
                        min="1"
                        onChange={handleCantidadChange}
                        placeholder="Ingrese la cantidad"
                        style={modalStyles.input}
                    />
                </div>

                <div style={modalStyles.inputGroup}>
                    <label style={modalStyles.label}>Cliente / Doctor</label>
                    <input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        placeholder="Nombre del cliente (opcional)"
                        style={modalStyles.input}
                    />
                </div>

                {cantidadNum > 0 && (
                    <div style={modalStyles.card}>
                        <div style={modalStyles.cardContent}>
                            <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#019391' }}>
                                Total: {formatPrice(totalPrice)}
                            </div>
                        </div>
                    </div>
                )}

                <div style={modalStyles.buttonGroup}>
                    <button 
                        style={{...modalStyles.button, ...modalStyles.primaryButton, flex: 1}} 
                        onClick={registrarVenta} 
                        disabled={loading}
                    >
                        {loading ? <div style={modalStyles.spinner}></div> : 'Confirmar Venta'}
                    </button>
                    <button 
                        style={{...modalStyles.button, ...modalStyles.secondaryButton, flex: 1}} 
                        onClick={onDidDismiss} 
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    };

    const renderHistorial = () => {
        if (!producto) return null;
        
        const titulo = modalType === 'ventas' ? 'Ventas' : 'Ingresos';
        
        return (
            <div>
                {modalType === 'ingresos' && (
                    <button 
                        style={{...modalStyles.button, ...modalStyles.primaryButton, width: '100%', marginBottom: '16px'}} 
                        onClick={() => setShowIngresoModal(true)} 
                        disabled={loading}
                    >
                        Registrar ingreso
                    </button>
                )}

                <div style={modalStyles.card}>
                    <div style={modalStyles.cardHeader}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                            {titulo} - {producto.nombre}
                        </h3>
                        {modalType === 'ventas' && (
                            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                Total vendido: <strong>{formatPrice(totalVentas)}</strong>
                            </div>
                        )}
                    </div>
                    <div style={modalStyles.cardContent}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                <div style={{...modalStyles.spinner, width: '32px', height: '32px'}}></div>
                            </div>
                        ) : registros.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                                No hay registros de {titulo.toLowerCase()}
                            </div>
                        ) : (
                            <div style={modalStyles.historialContainer}>
                                {registros.map((registro, index) => (
                                    <div key={registro.id} style={modalStyles.registroItem}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>#{index+1}</p>
                                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                                                    {formatDate(registro.fecha)}
                                                </p>
                                                {registro.doctor && (
                                                    <p style={{ fontSize: '14px', margin: '0' }}>
                                                        <strong>Doctor:</strong> {registro.doctor}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>
                                                    {modalType === 'ventas'
                                                        ? `-${registro.salida} u.`
                                                        : `+${registro.ingreso} u.`}
                                                </p>
                                                {registro.precio && (
                                                    <p style={{ fontSize: '14px', color: '#10b981', margin: '0' }}>
                                                        {formatPrice(registro.precio)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (!producto) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No hay producto seleccionado
                </div>
            );
        }
        
        switch (modalType) {
            case 'vender': return renderVentaForm();
            case 'ventas':
            case 'ingresos': return renderHistorial();
            default: 
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        Tipo de modal no válido
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    input:focus {
                        border-color: #019391 !important;
                        box-shadow: 0 0 0 3px rgba(1, 147, 145, 0.1);
                    }
                    
                    button:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    
                    button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                `}
            </style>
            
            <div style={modalStyles.overlay} onClick={onDidDismiss}>
                <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                    <div style={modalStyles.header}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                            {getModalTitle()}
                        </h2>
                        <button style={modalStyles.closeButton} onClick={onDidDismiss}>
                            ×
                        </button>
                    </div>
                    <div style={modalStyles.content}>
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* MODAL PARA REGISTRAR INGRESO */}
            {showIngresoModal && (
                <div style={modalStyles.overlay} onClick={() => setShowIngresoModal(false)}>
                    <div style={{...modalStyles.modal, width: '500px'}} onClick={(e) => e.stopPropagation()}>
                        <div style={modalStyles.header}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                Registrar ingreso
                            </h2>
                            <button style={modalStyles.closeButton} onClick={() => setShowIngresoModal(false)}>
                                ×
                            </button>
                        </div>
                        <div style={modalStyles.content}>
                            <div style={modalStyles.inputGroup}>
                                <label style={modalStyles.label}>Cantidad *</label>
                                <input
                                    type="number"
                                    value={ingresoCantidad}
                                    onChange={handleIngresoCantidadChange}
                                    placeholder="Unidades que ingresan"
                                    style={modalStyles.input}
                                />
                            </div>

                            <div style={modalStyles.inputGroup}>
                                <label style={modalStyles.label}>Precio unitario (opcional)</label>
                                <input
                                    type="number"
                                    value={ingresoPrecio}
                                    onChange={handleIngresoPrecioChange}
                                    placeholder="Bs"
                                    style={modalStyles.input}
                                />
                            </div>

                            <div style={modalStyles.buttonGroup}>
                                <button 
                                    style={{...modalStyles.button, ...modalStyles.primaryButton, flex: 1}} 
                                    onClick={registrarIngreso} 
                                    disabled={loading}
                                >
                                    {loading ? <div style={modalStyles.spinner}></div> : 'Guardar'}
                                </button>
                                <button 
                                    style={{...modalStyles.button, ...modalStyles.secondaryButton, flex: 1}} 
                                    onClick={() => setShowIngresoModal(false)} 
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            <div style={toastStyles}>
                {toast.message}
            </div>
        </>
    );
};

export default ProductoModal;