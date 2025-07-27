import { useState } from 'react';
import api from '../services/api';

interface Props {
  isOpen: boolean;
  onDidDismiss: () => void;
  onGrupoCreado: () => void;
}

const AgregarGrupoModal: React.FC<Props> = ({ isOpen, onDidDismiss, onGrupoCreado }) => {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      showToast('El nombre del grupo es requerido');
      return;
    }

    try {
      setLoading(true);
      await api.post('/grupo', { nombre: nombre.trim() });

      showToast('Grupo creado exitosamente', 'success');
      setNombre('');
      onGrupoCreado();
      onDidDismiss();
    } catch (error: any) {
      console.error('Error al crear grupo:', error);
      showToast(error.response?.data?.message || 'Error al crear grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNombre('');
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
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ backgroundColor: '#019391', color: 'white', padding: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Agregar Grupo</h2>
        </div>

        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Nombre del grupo *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '16px',
              backgroundColor: 'white'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ccc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#019391',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AgregarGrupoModal;
