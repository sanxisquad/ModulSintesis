import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../../context/MenuContext';
import { ContenedorList } from '../../components/zr/ContenedorList';
import { MapView } from '../../components/MapView/MapContainer.jsx';
import { FilterPanel } from '../../components/common/FilterPanel';
import { getAllContenedors, getAllZones } from '../../api/zr.api.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trash2, Database, CircleAlert, Filter, PlusCircle, Map, List, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export function GestorContenedors() {
  const { menuOpen } = useMenu();
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'map'
  const [showStats, setShowStats] = useState(true); // New state for statistics panel toggle
  const [selectedEstat, setSelectedEstat] = useState(null); // New state to track selected estat
  const [filters, setFilters] = useState({
    ciutat: '',
    zona: '',
    // estat filter removed
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
  
  // Opciones fijas para tipo
  // estatOptions removed as it's now handled by the cards
  const tipusOptions = ['vidre', 'paper', 'plàstic', 'orgànic', 'indiferenciat'];

  // Datos para estadísticas y gráficos
  const stats = {
    total: contenedores.length,
    ple: contenedores.filter(c => c.estat === 'ple').length,
    mig: contenedores.filter(c => c.estat === 'mig').length,
    buit: contenedores.filter(c => c.estat === 'buit').length,
    alertas: contenedores.filter(c => c.alerta).length
  };

  // Datos para el gráfico de estados
  const estatData = [
    { name: 'Ple', value: stats.ple },
    { name: 'Mig Ple', value: stats.mig },
    { name: 'Buit', value: stats.buit }
  ];
  
  const COLORS = ['#FF8042', '#FFBB28', '#00C49F'];

  // Filtrar contenedores basado en los filtros
  const filteredContenedores = contenedores.filter(c => {
    if (filters.ciutat && c.ciutat !== filters.ciutat) return false;
    if (filters.zona && c.zona !== Number(filters.zona)) return false;
    if (selectedEstat && c.estat !== selectedEstat) return false; // Use the new selectedEstat instead
    if (filters.tipus && c.tipus !== filters.tipus) return false;
    if (filters.codi && !c.cod?.toLowerCase().includes(filters.codi.toLowerCase())) return false;
    return true;
  });

  // Function to handle clicking on a state card
  const handleEstatCardClick = (estat) => {
    setSelectedEstat(prevEstat => prevEstat === estat ? null : estat);
  };

  // Replace the RefreshCw with a standard spinner
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg text-gray-800">Carregant dades...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestió de Contenidors</h1>
              <p className="text-gray-500 text-sm">Administració i control de contenidors del sistema</p>
            </div>
          </div>
        </div>
        
        {/* Tarjetas de estadísticas básicas - moved outside collapsible section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contenidors</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
                {/* Removed conditional filtering message */}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
              selectedEstat === 'ple' ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleEstatCardClick('ple')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contenidors Plens</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.ple}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(stats.ple / stats.total * 100) || 0}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
              selectedEstat === 'mig' ? 'ring-2 ring-yellow-500' : ''
            }`}
            onClick={() => handleEstatCardClick('mig')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Mig Plens</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.mig}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(stats.mig / stats.total * 100) || 0}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
              selectedEstat === 'buit' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => handleEstatCardClick('buit')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Buits</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.buit}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(stats.buit / stats.total * 100) || 0}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Alertes</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.alertas}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.alertas > 0 ? 'Requereixen atenció' : 'Cap alerta'}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <CircleAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas toggle button - now only for charts */}
        <div className="mb-2 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Gràfics i estadístiques avançades</div>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
            aria-label={showStats ? 'Amagar estadístiques' : 'Mostrar estadístiques'}
          >
            {showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {/* Panel de visualizaciones analíticas - Collapsible (solo gráficos) */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showStats ? 'max-h-[1200px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          {/* Visualizaciones analíticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4 text-gray-800">Distribució d'Estat</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estatData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {estatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4 text-gray-800">Resum per Tipus</h2>
              <div className="space-y-3">
                {tipusOptions.map(tipus => {
                  const count = contenedores.filter(c => c.tipus === tipus).length;
                  const percentage = contenedores.length > 0 ? (count / contenedores.length * 100).toFixed(1) : 0;
                  return (
                    <div key={tipus} className="flex items-center">
                      <div className="w-32 text-gray-700 capitalize font-medium">{tipus}</div>
                      <div className="flex-grow">
                        <div className="bg-gray-200 h-5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-24 text-right text-gray-700 font-medium">
                        {count} ({percentage}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de acción con filtros y botones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filtres</span>
            </button>
            
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Llista</span>
              </button>
              <button 
                className={`px-3 py-2 flex items-center ${viewMode === 'map' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Mapa</span>
              </button>
            </div>
          </div>
          
          <Link
            to="/contenedors-create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Afegir Contenidor</span>
            <span className="sm:hidden">Afegir</span>
          </Link>
        </div>
        
        {/* Panel de filtros (sin el filtro de estat) */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel 
              filters={filters}
              setFilters={setFilters}
              mode="contenedor"
              ciudades={ciudadesOptions}
              zonas={zonasOptions}
              // estatOptions removed from here
              tipusOptions={tipusOptions}
            />
          </div>
        )}
        
        {/* Visualización de datos (lista o mapa) */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <ContenedorList 
              filters={filters}
              contenedores={filteredContenedores} // Pass the already filtered data
              zonas={zonas}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[600px]">
            <MapView 
              filters={filters} 
              contenedores={filteredContenedores} // Make sure we pass filtered data here too
              zonas={zonas}
            />
          </div>
        )}
      </div>
    </div>
  );
}