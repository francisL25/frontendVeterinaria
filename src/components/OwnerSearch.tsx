import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IonSearchbar,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { searchOutline, personOutline, closeOutline } from 'ionicons/icons';
import api from '../services/api';

interface Owner {
  id: number;
  nombreDueno: string;
  carnetIdentidad: string;
  telefono: string;
  direccion: string;
}

interface OwnerSearchProps {
  onOwnerSelect: (owner: Owner) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  disabled?: boolean;
}

const OwnerSearch: React.FC<OwnerSearchProps> = ({
  onOwnerSelect,
  onError,
  onSuccess,
  disabled = false
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Función optimizada de búsqueda con debounce y cache
  const searchOwners = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setOwners([]);
      setHasSearched(false);
      return;
    }

    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch.length < 2) return;

    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await api.get('/historial/busqueda/dueno', {
        params: { texto: trimmedSearch },
        timeout: 10000, // 10 segundos de timeout
      });

      // Optimización: usar Map para eliminar duplicados más eficientemente
      const uniqueOwnersMap = new Map<string, Owner>();
      
      response.data.forEach((historial: any, index: number) => {
        const ownerKey = `${historial.carnetIdentidad}`;
        const searchLower = trimmedSearch.toLowerCase();
        
        // Verificar que coincida con el criterio de búsqueda
        const matchesName = historial.nombreDueno?.toLowerCase().includes(searchLower);
        const matchesCarnet = historial.carnetIdentidad?.includes(trimmedSearch);
        
        if ((matchesName || matchesCarnet) && !uniqueOwnersMap.has(ownerKey)) {
          uniqueOwnersMap.set(ownerKey, {
            id: index,
            nombreDueno: historial.nombreDueno || '',
            carnetIdentidad: historial.carnetIdentidad || '',
            telefono: historial.telefono || '',
            direccion: historial.direccion || ''
          });
        }
      });

      // Convertir Map a Array y ordenar por nombre
      const uniqueOwners = Array.from(uniqueOwnersMap.values())
        .sort((a, b) => a.nombreDueno.localeCompare(b.nombreDueno))
        .slice(0, 10); // Limitar a 10 resultados

      setOwners(uniqueOwners);
    } catch (error: any) {
      console.error('Error al buscar dueños:', error);
      
      // Manejo de errores más específico
      if (error.code === 'ECONNABORTED') {
        onError('Tiempo de espera agotado. Intente nuevamente.');
      } else if (error.response?.status === 404) {
        onError('Servicio de búsqueda no disponible.');
      } else {
        onError('Error al buscar dueños. Verifique su conexión.');
      }
      
      setOwners([]);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Debounce optimizado con cleanup
  useEffect(() => {
    if (!isSearchOpen) return;

    const timeoutId = setTimeout(() => {
      searchOwners(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, isSearchOpen, searchOwners]);

  // Función para seleccionar un dueño
  const handleOwnerSelect = useCallback((owner: Owner) => {
    onOwnerSelect(owner);
    setSearchText(owner.nombreDueno);
    setIsSearchOpen(false);
    setOwners([]);
    setHasSearched(false);
    onSuccess('Datos del dueño completados automáticamente');
  }, [onOwnerSelect, onSuccess]);

  // Función para alternar la búsqueda
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      const newState = !prev;
      if (!newState) {
        // Limpiar al cerrar
        setSearchText('');
        setOwners([]);
        setHasSearched(false);
      }
      return newState;
    });
  }, []);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchText('');
    setOwners([]);
    setHasSearched(false);
  }, []);

  // Memorizar el contenido de la lista para evitar re-renders innecesarios
  const ownersList = useMemo(() => {
    if (!isSearchOpen) return null;

    return (
      <div className="mt-2">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <IonSpinner name="crescent" />
            <IonText color="medium" className="ml-2">Buscando...</IonText>
          </div>
        )}

        {!isLoading && owners.length > 0 && (
          <IonList className="rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            {owners.map((owner) => (
              <IonItem
                key={`${owner.carnetIdentidad}-${owner.id}`}
                button
                onClick={() => handleOwnerSelect(owner)}
                className="hover:bg-gray-50 transition-colors"
              >
                <div className="w-full py-1">
                  <IonLabel>
                    <h3 className="font-semibold text-gray-900">{owner.nombreDueno}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">CI:</span> {owner.carnetIdentidad}
                      </p>
                      {owner.telefono && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tel:</span> {owner.telefono}
                        </p>
                      )}
                    </div>
                  </IonLabel>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}

        {!isLoading && hasSearched && searchText.length >= 2 && owners.length === 0 && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <IonText color="medium">
              <p>No se encontraron dueños con ese criterio</p>
              <p className="text-xs mt-1">Intente con otro nombre o carnet</p>
            </IonText>
          </div>
        )}
      </div>
    );
  }, [isSearchOpen, isLoading, owners, hasSearched, searchText, handleOwnerSelect]);

  return (
    <div className="flex-1 min-w-[250px]">
      <div className="rounded-lg border-2 border-gray-200 p-3 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div style={{ color: '#019391' }} className="flex items-center font-semibold">
            <IonIcon icon={personOutline} className="mr-2" />
            <span>Búsqueda de Dueño</span>
          </div>
          
          <div className="flex-1" />
          
          <IonButton
            size="small"
            fill={isSearchOpen ? "solid" : "outline"}
            color="medium"
            onClick={toggleSearch}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <IonIcon 
              slot="start" 
              icon={isSearchOpen ? closeOutline : searchOutline} 
            />
            {isSearchOpen ? 'Cerrar' : 'Buscar'}
          </IonButton>
        </div>

        {/* Barra de búsqueda */}
        {isSearchOpen && (
          <div className="mb-2">
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              onIonClear={clearSearch}
              placeholder="Buscar por nombre o carnet (mín. 2 caracteres)..."
              showClearButton="focus"
              debounce={0} // Manejamos el debounce manualmente
              disabled={disabled}
              className="custom-searchbar"
            />
          </div>
        )}

        {/* Lista de resultados */}
        {ownersList}

        {/* Indicador de estado */}
        {isSearchOpen && searchText.length > 0 && searchText.length < 2 && (
          <div className="text-center p-2">
            <IonText color="medium" className="text-sm">
              Ingrese al menos 2 caracteres para buscar
            </IonText>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerSearch;