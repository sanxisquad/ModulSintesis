import { useState, useMemo } from 'react';
import { Header } from "../../components/layout/Header";
import { MapView } from "../../components/MapView/MapContainer";
import { FilterPanel } from '../../components/common/FilterPanel';

export const HomePage = () => {
  // Estado para los filtros
  const [filters, setFilters] = useState({
    ciutat: '',
    zona: '',
    estat: '',
    tipus: '',
    usuari: '',
    codi: '',
    nom: '',
    role: '',
    showContenedores: true,
    showZones: true
  });

  // Datos de ejemplo para los filtros (deberías obtenerlos de tu API)
  const ciudades = useMemo(() => ['Barcelona', 'Madrid', 'Valencia'], []);
  const zonas = useMemo(() => [
    { id: 1, nom: 'Zona Centro' },
    { id: 2, nom: 'Zona Norte' }
  ], []);
  const estatOptions = useMemo(() => ['buit', 'mig', 'ple'], []);
  const tipusOptions = useMemo(() => ['vidre', 'paper', 'plàstic'], []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Header />
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-4xl text-black font-bold mb-4">Benvingut a ReciclamJa</h1>
        <p className="text-lg text-gray-700 mb-8">Es una app</p>
        
        {/* Panel de filtros */}
        <FilterPanel 
          filters={filters}
          setFilters={setFilters}
          ciudades={ciudades}
          zonas={zonas}
          estatOptions={estatOptions}
          tipusOptions={tipusOptions}
          mode="mapa" // Usamos el modo 'mapa' que incluye los toggles
        />
        
        {/* Mapa con los filtros aplicados */}
        <MapView 
          className="w-full h-full" 
          filters={filters} // Pasamos los filtros al MapView
        />
      </div>
    </div>
  );
};