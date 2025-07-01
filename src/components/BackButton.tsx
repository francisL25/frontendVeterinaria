// components/BackButton.tsx
import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonButton } from '@ionic/react';

interface BackButtonProps {
  fallback?: string;
  fill?: 'clear' | 'outline' | 'solid';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  fallback = '/tabs/tab1',
  fill = 'clear',
  size = 'default',
  disabled = false,
  className = ''
}) => {
  const history = useHistory();

  const handleBack = () => {
    if (disabled) return;

    try {
      // Verificar si hay historial disponible
      const canGoBack = window.history.length > 1;
      
      if (canGoBack) {
        history.goBack();
      } else {
        // Si no hay historial, ir a la ruta de fallback
        history.replace(fallback);
      }
    } catch (error) {
      console.warn('Error al navegar hacia atrás:', error);
      // En caso de error, navegar al fallback
      history.replace(fallback);
    }
  };

  return (
    <IonButton 
      color="medium" 
      fill= "solid"
      size={size}
      disabled={disabled}
      onClick={handleBack}
      className={className}
    >
      ← Volver
    </IonButton>
  );
};

export default BackButton;