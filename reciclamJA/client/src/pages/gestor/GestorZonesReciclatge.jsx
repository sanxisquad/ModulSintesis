import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from '../../context/MenuContext';
import { ZonaReciclatgeList } from '../../components/zr/ZonaReciclatgeList';
import { MapView } from '../../components/MapView/MapContainer.jsx';
import { FilterPanel } from '../../components/common/FilterPanel';
import { getAllZones, getAllContenedors } from '../../api/zr.api.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  RefreshCw, Search, PlusCircle, Edit, Trash2, MapPin, Filter,
  Database, ChevronUp, ChevronDown, Map, List, Building
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

export function GestorZona() {
  const { menuOpen } = useMenu();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [zonas, setZonas] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'map'
  const [showStats, setShowStats] = useState(true); // Estado para el panel de estadísticas
  const [filters, setFilters] = useState({
    ciutat: '',
    nom: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [zonasRes, contenedoresRes] = await Promise.all([
          getAllZones(),
          getAllContenedors()
        ]);
        setZonas(zonasRes.data);
        setContenedores(contenedoresRes.data);
        
        // Si es superadmin, obtener empresas únicas de las zonas
        if (isSuperAdmin) {
          const uniqueEmpresas = zonasRes.data
            .filter(zona => zona.empresa)
            .reduce((acc, zona) => {
              if (!acc.find(emp => emp.id === zona.empresa.id)) {
                acc.push(zona.empresa);
              }
              return acc;
            }, []);
          setEmpresas(uniqueEmpresas);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error cargando datos. Por favor, inténtelo de nuevo más tarde.");
        setLoading(false);
      }
    };

    loadData();
  }, [isSuperAdmin]);

  // Obtener opciones únicas para los filtros
  const ciudadesOptions = [...new Set(zonas.map(z => z.ciutat).filter(Boolean))];

  // Filtrar zonas basado en los filtros y empresa (UNA SOLA VEZ)
  const filteredZonas = zonas.filter(z => {
    if (filters.ciutat && z.ciutat !== filters.ciutat) return false;
    if (filters.nom && !z.nom?.toLowerCase().includes(filters.nom.toLowerCase())) return false;
    
    // Filtro por empresa para superadmin
    if (isSuperAdmin && selectedEmpresa !== 'all') {
      if (!z.empresa || z.empresa.id !== parseInt(selectedEmpresa)) return false;
    }
    
    return true;
  });

  // Estadísticas de zonas (actualizadas para considerar el filtro de empresa)
  const stats = {
    totalZonas: filteredZonas.length,
    totalContenedores: contenedores.filter(c => {
      if (isSuperAdmin && selectedEmpresa !== 'all') {
        const zona = zonas.find(z => z.id === c.zona);
        return zona && zona.empresa?.id === parseInt(selectedEmpresa);
      }
      return true;
    }).length,
    zonasConContenedores: [...new Set(contenedores.filter(c => {
      if (!c.zona) return false;
      if (isSuperAdmin && selectedEmpresa !== 'all') {
        const zona = zonas.find(z => z.id === c.zona);
        return zona && zona.empresa?.id === parseInt(selectedEmpresa);
      }
      return true;
    }).map(c => c.zona))].length,
    contenedoresNoAsignados: contenedores.filter(c => !c.zona).length,
    ciudades: ciudadesOptions.length
  };

  // Datos para el gráfico de contenedores por zona (filtrado por empresa)
  const prepareZoneData = () => {
    return filteredZonas.slice(0, 5).map(zona => {
      const zonaContenedores = contenedores.filter(c => c.zona === zona.id);
      return {
        name: zona.nom,
        total: zonaContenedores.length,
        plens: zonaContenedores.filter(c => c.estat === 'ple').length,
        mitjos: zonaContenedores.filter(c => c.estat === 'mig').length,
        buits: zonaContenedores.filter(c => c.estat === 'buit').length
      };
    }).sort((a, b) => b.total - a.total);
  };

  const zoneData = prepareZoneData();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <RefreshCw className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg text-gray-800">Carregant dades...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestió de Zones de Reciclatge</h1>
                <p className="text-gray-500 text-sm">Administració i control de zones del sistema</p>
              </div>
            </div>
            
            {/* Selector de empresas para superadmin */}
            {isSuperAdmin && empresas.length > 0 && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Totes les empreses</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Estadísticas toggle button */}
        <div className="mb-2 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Estadístiques</div>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors"
            aria-label={showStats ? 'Amagar estadístiques' : 'Mostrar estadístiques'}
          >
            {showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {/* Panel de estadísticas - Collapsible */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showStats ? 'max-h-[1200px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          {/* Tarjetas de estadísticas básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Zones</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalZonas}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isSuperAdmin && selectedEmpresa !== 'all' && 
                      `Empresa seleccionada`}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Contenidors</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalContenedores}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Zones amb Contenidors</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.zonasConContenedores}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(stats.zonasConContenedores / stats.totalZonas * 100) || 0}% del total
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contenidors sense Zona</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.contenedoresNoAsignados}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Database className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ciutats</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.ciudades}</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Gráfico de contenedores por zona */}
          <div className="bg-white p-4 rounded-lg shadow-sm mt-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Distribució de Contenidors por Zona (Top 5)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={zoneData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plens" name="Plens" fill="#FF8042" />
                  <Bar dataKey="mitjos" name="Mig Plens" fill="#FFBB28" />
                  <Bar dataKey="buits" name="Buits" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
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
            to="/zones-create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Afegir Zona</span>
            <span className="sm:hidden">Afegir</span>
          </Link>
        </div>
        
        {/* Panel de filtros */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel 
              filters={filters}
              setFilters={setFilters}
              mode="zones"
              ciudades={ciudadesOptions}
            />
          </div>
        )}
        
        {/* Visualización de datos (lista o mapa) */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <ZonaReciclatgeList 
              filters={filters}
              zonas={filteredZonas}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[600px]">
            <MapView 
              filters={{...filters, showZones: true, showContenedores: true}} 
              zonas={filteredZonas}
              contenedores={contenedores.filter(c => {
                if (isSuperAdmin && selectedEmpresa !== 'all') {
                  const zona = zonas.find(z => z.id === c.zona);
                  return zona && zona.empresa?.id === parseInt(selectedEmpresa);
                }
                return true;
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}