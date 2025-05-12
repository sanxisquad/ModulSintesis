import { useState, useEffect } from 'react';
import { Header } from "../../components/layout/Header";
import { MapView } from "../../components/MapView/MapContainer";
import { FilterPanel } from '../../components/common/FilterPanel';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  getAllContenedors, 
  getAllZones, 
  getAllPublicContenedors, 
  getAllPublicZones 
} from '../../api/zr.api.js';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { canEditZR } = usePermissions();

  const [filters, setFilters] = useState({
    ciutat: '',
    zona: '',
    estat: '',
    tipus: '',
    codi: '',
    nom: '',
    showContenedores: true,
    showZones: true
  });

  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which API to use
        const shouldUsePrivateAPI = isAuthenticated && canEditZR;
        
        const [contenedoresRes, zonasRes] = await Promise.all([
          shouldUsePrivateAPI ? getAllContenedors() : getAllPublicContenedors(),
          shouldUsePrivateAPI ? getAllZones() : getAllPublicZones()
        ]);
        
        setContenedores(contenedoresRes.data);
        setZonas(zonasRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        
        // Fallback to public API if private fails
        if (isAuthenticated) {
          try {
            const [publicContenedores, publicZonas] = await Promise.all([
              getAllPublicContenedors(),
              getAllPublicZones()
            ]);
            setContenedores(publicContenedores.data);
            setZonas(publicZonas.data);
          } catch (fallbackErr) {
            console.error('Fallback failed:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, canEditZR]);

  const ciudades = [...new Set(contenedores.map(c => c.ciutat).filter(Boolean))];
  const zonas_options = zonas.map(zona => ({ id: zona.id, nom: zona.nom }));
  
  const estatOptions = ['buit', 'mig', 'ple'];
  const tipusOptions = ['vidre', 'paper', 'plàstic', 'orgànic', 'indiferenciat'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Header />
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-4xl text-black font-bold mb-4">Benvingut a ReciclamJa</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">
              Hi ha hagut un error carregant les dades. Estàs veient informació pública.
            </p>
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-700">
              Estàs veient la versió pública de ReciclamJa. 
              <a href="/login" className="ml-2 font-medium underline">Inicia sessió</a> per accedir a més funcionalitats i continguts.
            </p>
          </div>
        )}
        
        <p className="text-lg text-gray-700 mb-8">
          Gestionem els teus residus de manera eficient i sostenible
        </p>
        
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          ciudades={ciudades}
          zonas={zonas_options}
          estatOptions={estatOptions}
          tipusOptions={tipusOptions}
          mode="mapa"
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Carregant dades...</p>
            </div>
          </div>
        ) : (
          <MapView
            className="w-full h-full"
            filters={filters}
            contenedores={contenedores}
            zonas={zonas}
          />
        )}
      </div>
    </div>
  );
};