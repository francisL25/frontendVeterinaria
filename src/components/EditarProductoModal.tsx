import { useState, useEffect } from 'react';
import api from '../services/api';
import dayjs from 'dayjs';

interface Producto {
  id: number;
  nombre: string;
  fecha_vencimiento: string;
  precio_unitario: number;
  stock: number;
}

interface Props {
  isOpen: boolean;
  onDidDismiss: () => void;
  onProductoActualizado: () => void;
  producto: Producto | null;
}

const EditarProductoModal: React.FC<Props> = ({ isOpen, onDidDismiss, onProductoActualizado, producto }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_vencimiento: '',
    precio_unitario: '',
    stock: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // SOLUCIÓN: Agregar isOpen como dependencia y cargar datos cuando el modal se abre
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombre: producto.nombre,
        fecha_vencimiento: dayjs(producto.fecha_vencimiento).format('YYYY-MM-DD'),
        precio_unitario: producto.precio_unitario.toString(),
        stock: producto.stock.toString(),
      });
    }
  }, [producto, isOpen]); // Agregamos isOpen como dependencia

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showToast('El nombre es requerido');
      return false;
    }
    if (!formData.fecha_vencimiento) {
      showToast('La fecha de vencimiento es requerida');
      return false;
    }
    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      showToast('El precio unitario debe ser mayor a 0');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      showToast('El stock debe ser mayor o igual a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !producto) return;

    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        fecha_vencimiento: formData.fecha_vencimiento,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock: parseInt(formData.stock),
      };

      await api.put(`/productos/${producto.id}`, dataToSend);

      showToast('Producto actualizado exitosamente', 'success');

      onProductoActualizado();
      onDidDismiss();
    } catch (error: any) {
      console.error('Error al actualizar producto', error);
      showToast(error.response?.data?.message || error.message || 'Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // SOLUCIÓN ALTERNATIVA: No limpiar formData aquí, solo cerrar el modal
    // setFormData({
    //   nombre: '',
    //   fecha_vencimiento: '',
    //   precio_unitario: '',
    //   stock: '',
    // });
    setToast(null);
    onDidDismiss();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{
          backgroundColor: '#019391',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
            Editar Producto
          </h2>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Nombre */}
            <label>
              Nombre
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                disabled={loading}
                style={{ backgroundColor: 'white', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Nombre del producto"
                
              />
            </label>

            {/* Fecha de vencimiento */}
            <label>
              Fecha de vencimiento
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                disabled={loading}
                style={{backgroundColor: 'white', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>

            {/* Precio unitario */}
            <label>
              Precio unitario
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => handleChange('precio_unitario', e.target.value)}
                disabled={loading}
                style={{ backgroundColor: 'white', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Precio unitario"
              />
            </label>

            {/* Stock 
            
            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                disabled={loading}
                style={{ backgroundColor: 'white', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="Stock disponible"
              />
            </label>
            */}

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: '#019391',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white',
          fontWeight: 500,
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'opacity 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default EditarProductoModal;