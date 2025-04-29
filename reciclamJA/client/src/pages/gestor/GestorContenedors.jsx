import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importación añadida
import { useMenu } from '../../context/MenuContext';
import { ContenedorList } from '../../components/zr/ContenedorList';
import { MapView } from '../../components/MapView/MapContainer.jsx';
import { FilterPanel } from '../../components/common/FilterPanel';
import { getAllContenedors, getAllZones } from '../../api/zr.api.js';

export function GestorContenedors() {
  const { menuOpen } = useMenu();
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [contenedoresRes, zonasRes] = await Promise.all([
          getAllContenedors(),
          getAllZones()
        ]);
        setContenedores(contenedoresRes.data);
        setZonas(zonasRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Obtener opciones únicas para los filtros
  const ciudadesOptions = [...new Set(contenedores.map(c => c.ciutat).filter(Boolean))];
  const zonasOptions = zonas.map(zona => ({ id: zona.id, nom: zona.nom }));
  
  // Opciones fijas para estado y tipo
  const estatOptions = ['ple', 'mig', 'buit'];
  const tipusOptions = ['vidre', 'paper', 'plàstic', 'orgànic', 'indiferenciat'];

  if (isLoading) return <div className="text-center p-8">Carregant dades...</div>;

  return (
    <div className={`transition-all duration-300 ease-in-out ${menuOpen ? 'ml-64' : 'ml-0'}`}>
      <h1 className="text-3xl font-bold text-center m-10">Contenidors</h1>
      
      <div className="flex justify-end mb-5 mr-10">
        <Link
          to="/contenedors-create"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
        >
          Afegir Contenidor
        </Link>
      </div>

      <FilterPanel 
        filters={filters}
        setFilters={setFilters}
        mode="contenedor"
        ciudades={ciudadesOptions}
        zonas={zonasOptions}
        estatOptions={estatOptions}
        tipusOptions={tipusOptions}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="lg:col-span-2">
          <ContenedorList 
            filters={filters}
            contenedores={contenedores}
            zonas={zonas}
          />
        </div>
        <div className="lg:col-span-2">
          <MapView 
            filters={filters} 
            contenedores={contenedores}
            zonas={zonas}
          />
        </div>
      </div>
    </div>
  );
}