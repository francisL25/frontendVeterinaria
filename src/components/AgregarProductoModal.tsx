import { useState } from 'react';
import api from '../services/api';

interface Props {
  isOpen: boolean;
  onDidDismiss: () => void;
  onProductoCreado: () => void;
  idGrupo: string; //
}

const AgregarProductoModal: React.FC<Props> = ({ isOpen, onDidDismiss, onProductoCreado, idGrupo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_vencimiento: '',
    precio_unitario: '',
    stock: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        fecha_vencimiento: formData.fecha_vencimiento,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock: parseInt(formData.stock),
        
        id_grupo: parseInt(idGrupo), 
      };

      await api.post('/productos', dataToSend);

      showToast('Producto creado exitosamente', 'success');

      setFormData({
        nombre: '',
        fecha_vencimiento: '',
        precio_unitario: '',
        stock: '',
        
      });

      onProductoCreado();
      onDidDismiss();
    } catch (error: any) {
      console.error('Error al crear producto', error);
      showToast(
        error.response?.data?.message || error.message || 'Error al crear el producto'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      fecha_vencimiento: '',
      precio_unitario: '',
      stock: '',
      
    });
    setToast(null);
    onDidDismiss();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

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
        {/* Header */}
        <div
          style={{
            backgroundColor: '#019391',
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
            Agregar Producto
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

        {/* Content */}
        <div style={{ padding: '20px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Precio unitario *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_unitario}
                onChange={(e) => handleChange('precio_unitario', e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Stock inicial *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Buttons */}
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
                {loading ? 'Guardando...' : 'Guardar'}
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

export default AgregarProductoModal;
